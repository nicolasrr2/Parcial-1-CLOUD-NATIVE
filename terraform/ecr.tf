# Repositorio ECR para la imagen Docker del backend Spring Boot.
resource "aws_ecr_repository" "backend" {
  name                 = "dsy1107-romo3219801-backend"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Project = "Pedidos360"
    Course  = "DSY1107"
  }
}
