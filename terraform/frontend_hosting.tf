# Aplicacion Amplify preparada para despliegues manuales desde CI/CD.
resource "aws_amplify_app" "frontend" {
  name     = "dsy1107-romo3219801-frontend"
  platform = "WEB"

  tags = {
    Project = "Pedidos360"
    Course  = "DSY1107"
  }
}

# Rama productiva sin builds automaticos ni conexion directa a GitHub.
resource "aws_amplify_branch" "main" {
  app_id            = aws_amplify_app.frontend.id
  branch_name       = "main"
  stage             = "PRODUCTION"
  enable_auto_build = false

  depends_on = [aws_amplify_app.frontend]
}
