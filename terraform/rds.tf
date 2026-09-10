# Red existente del laboratorio; no se crean redes nuevas.
data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# Security Group reservado para las tareas ECS del backend.
resource "aws_security_group" "backend" {
  name        = "dsy1107-romo3219801-backend-sg"
  description = "Salida del backend Pedidos360 hacia servicios necesarios"
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

# Security Group privado: PostgreSQL solo recibe trafico desde ECS.
resource "aws_security_group" "database" {
  name        = "dsy1107-romo3219801-rds-sg"
  description = "Acceso privado a PostgreSQL desde el backend"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description     = "PostgreSQL desde el backend ECS"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.backend.id]
  }

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

resource "aws_db_subnet_group" "postgres" {
  name       = "dsy1107-romo3219801-db-subnets"
  subnet_ids = data.aws_subnets.default.ids

  tags = {
    Project = "Pedidos360"
    Course  = "DSY1107"
  }
}

# La contrasena se genera en Terraform y no se expone mediante outputs.
resource "random_password" "rds_master" {
  length           = 24
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

resource "aws_db_instance" "postgres" {
  identifier = "dsy1107-romo3219801-postgres"

  engine                 = "postgres"
  instance_class         = "db.t3.micro"
  allocated_storage      = 20
  storage_type           = "gp3"
  db_name                = "pedidos360"
  username               = "pedidos360"
  password               = random_password.rds_master.result
  port                   = 5432
  db_subnet_group_name   = aws_db_subnet_group.postgres.name
  vpc_security_group_ids = [aws_security_group.database.id]

  publicly_accessible     = false
  multi_az                = false
  storage_encrypted       = true
  skip_final_snapshot     = true
  deletion_protection     = false
  backup_retention_period = 0
  apply_immediately       = true

  tags = {
    Project = "Pedidos360"
    Course  = "DSY1107"
  }
}
