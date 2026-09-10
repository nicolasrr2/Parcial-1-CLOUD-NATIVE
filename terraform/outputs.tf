output "api_url" {
  description = "Endpoint base de API Gateway"
  value       = aws_apigatewayv2_api.api_manager.api_endpoint
}

output "url_datos" {
  description = "URL del endpoint protegido"
  value       = "${aws_apigatewayv2_api.api_manager.api_endpoint}/datos"
}

output "url_publico" {
  description = "URL del endpoint publico"
  value       = "${aws_apigatewayv2_api.api_manager.api_endpoint}/publico/datos"
}

output "cognito_user_pool_id" {
  description = "ID del grupo de usuarios de Cognito"
  value       = aws_cognito_user_pool.pool.id
}

output "cognito_client_id" {
  description = "ID del cliente publico de Cognito"
  value       = aws_cognito_user_pool_client.spa.id
}

output "cognito_domain" {
  description = "Dominio completo de Cognito Hosted UI"
  value       = "https://${aws_cognito_user_pool_domain.domain.domain}.auth.us-east-1.amazoncognito.com"
}

output "cognito_issuer" {
  description = "Emisor de tokens JWT de Cognito"
  value       = "https://cognito-idp.us-east-1.amazonaws.com/${aws_cognito_user_pool.pool.id}"
}

output "cognito_group_solicitantes" {
  description = "Nombre del grupo Cognito de solicitantes"
  value       = aws_cognito_user_group.solicitantes.name
}

output "cognito_group_aprobadores" {
  description = "Nombre del grupo Cognito de aprobadores"
  value       = aws_cognito_user_group.aprobadores.name
}

output "cognito_pre_token_generation_lambda" {
  description = "Nombre de la Lambda Pre Token Generation"
  value       = aws_lambda_function.user_token_ms.function_name
}

output "ecr_backend_repository_url" {
  description = "URL del repositorio ECR del backend"
  value       = aws_ecr_repository.backend.repository_url
}

output "ecr_backend_repository_name" {
  description = "Nombre del repositorio ECR del backend"
  value       = aws_ecr_repository.backend.name
}

output "rds_endpoint" {
  value = aws_db_instance.postgres.address
}

output "rds_port" {
  value = aws_db_instance.postgres.port
}

output "rds_database_name" {
  value = aws_db_instance.postgres.db_name
}

output "rds_username" {
  value = aws_db_instance.postgres.username
}

output "backend_security_group_id" {
  value = aws_security_group.backend.id
}

output "rds_security_group_id" {
  value = aws_security_group.database.id
}

output "env_frontend" {
  description = "Variables para frontend/.env.local"
  value       = <<-EOT
VITE_AWS_REGION=us-east-1
VITE_COGNITO_DOMAIN=https://${aws_cognito_user_pool_domain.domain.domain}.auth.us-east-1.amazoncognito.com
VITE_COGNITO_CLIENT_ID=${aws_cognito_user_pool_client.spa.id}
VITE_REDIRECT_URI=http://localhost:5173/
VITE_API_URL=${aws_apigatewayv2_api.api_manager.api_endpoint}
EOT
}
