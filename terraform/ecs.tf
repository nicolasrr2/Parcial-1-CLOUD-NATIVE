# Logs de la tarea ECS del backend.
resource "aws_cloudwatch_log_group" "backend" {
  name              = "/ecs/dsy1107-romo3219801-backend"
  retention_in_days = 1

  tags = {
    Project = "Pedidos360"
    Course  = "DSY1107"
  }
}

# La contrasena de RDS se entrega al contenedor mediante Secrets Manager.
resource "aws_secretsmanager_secret" "rds_password" {
  name                    = "dsy1107-romo3219801-rds-password"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "rds_password" {
  secret_id     = aws_secretsmanager_secret.rds_password.id
  secret_string = random_password.rds_master.result
}

# Security Group reservado para el futuro VPC Link de API Gateway.
resource "aws_security_group" "apigw_vpc_link" {
  name        = "dsy1107-romo3219801-apigw-vpc-link-sg"
  description = "Salida del VPC Link hacia el ALB interno"
  vpc_id      = data.aws_vpc.default.id

  egress {
    description = "Salida IPv4 general"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Project = "Pedidos360"
    Course  = "DSY1107"
  }
}

# El ALB solo acepta trafico desde el VPC Link.
resource "aws_security_group" "alb" {
  name        = "dsy1107-romo3219801-alb-sg"
  description = "Acceso interno al ALB de Pedidos360"
  vpc_id      = data.aws_vpc.default.id

  egress {
    description = "Salida IPv4 general"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Project = "Pedidos360"
    Course  = "DSY1107"
  }
}

resource "aws_vpc_security_group_ingress_rule" "alb_from_apigw" {
  security_group_id            = aws_security_group.alb.id
  referenced_security_group_id = aws_security_group.apigw_vpc_link.id
  from_port                    = 80
  to_port                      = 80
  ip_protocol                  = "tcp"
  description                  = "HTTP desde API Gateway VPC Link"
}

resource "aws_vpc_security_group_ingress_rule" "backend_from_alb" {
  security_group_id            = aws_security_group.backend.id
  referenced_security_group_id = aws_security_group.alb.id
  from_port                    = 8080
  to_port                      = 8080
  ip_protocol                  = "tcp"
  description                  = "HTTP desde el ALB interno"
}

resource "aws_lb" "backend" {
  name               = "dsy1107-romo3219801-alb"
  internal           = true
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = data.aws_subnets.default.ids

  enable_deletion_protection = false

  tags = {
    Project = "Pedidos360"
    Course  = "DSY1107"
  }
}

resource "aws_lb_target_group" "backend" {
  name                 = "dsy1107-romo3219801-tg"
  port                 = 8080
  protocol             = "HTTP"
  target_type          = "ip"
  vpc_id               = data.aws_vpc.default.id
  deregistration_delay = 10

  health_check {
    enabled             = true
    path                = "/actuator/health"
    protocol            = "HTTP"
    matcher             = "200"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
  }
}

resource "aws_lb_listener" "backend" {
  load_balancer_arn = aws_lb.backend.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }
}

resource "aws_ecs_cluster" "backend" {
  name = "dsy1107-romo3219801-cluster"

  tags = {
    Project = "Pedidos360"
    Course  = "DSY1107"
  }
}

resource "aws_ecs_task_definition" "backend" {
  family                   = "dsy1107-romo3219801-backend"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = data.aws_iam_role.lab_role.arn
  task_role_arn            = data.aws_iam_role.lab_role.arn

  container_definitions = jsonencode([
    {
      name      = "pedidos360-backend"
      image     = "${aws_ecr_repository.backend.repository_url}:latest"
      essential = true

      portMappings = [
        {
          containerPort = 8080
          hostPort      = 8080
          protocol      = "tcp"
        }
      ]

      environment = [
        {
          name  = "DB_URL"
          value = "jdbc:postgresql://${aws_db_instance.postgres.address}:5432/${aws_db_instance.postgres.db_name}"
        },
        {
          name  = "DB_USERNAME"
          value = aws_db_instance.postgres.username
        },
        {
          name  = "COGNITO_ISSUER"
          value = "https://cognito-idp.us-east-1.amazonaws.com/${aws_cognito_user_pool.pool.id}"
        },
        {
          name  = "COGNITO_CLIENT_ID"
          value = aws_cognito_user_pool_client.spa.id
        }
      ]

      secrets = [
        {
          name      = "DB_PASSWORD"
          valueFrom = aws_secretsmanager_secret.rds_password.arn
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.backend.name
          "awslogs-region"        = "us-east-1"
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])

  depends_on = [aws_secretsmanager_secret_version.rds_password]
}

resource "aws_ecs_service" "backend" {
  name             = "dsy1107-romo3219801-backend-service"
  cluster          = aws_ecs_cluster.backend.id
  task_definition  = aws_ecs_task_definition.backend.arn
  desired_count    = 1
  launch_type      = "FARGATE"
  platform_version = "LATEST"

  health_check_grace_period_seconds = 120

  network_configuration {
    subnets          = data.aws_subnets.default.ids
    security_groups  = [aws_security_group.backend.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.backend.arn
    container_name   = "pedidos360-backend"
    container_port   = 8080
  }

  depends_on = [aws_lb_listener.backend]

  deployment_minimum_healthy_percent = 50
  deployment_maximum_percent         = 200

  tags = {
    Project = "Pedidos360"
    Course  = "DSY1107"
  }
}
