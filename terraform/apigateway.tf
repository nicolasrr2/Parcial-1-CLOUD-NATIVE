# API HTTP que expone el backend de indicadores.
resource "aws_apigatewayv2_api" "api_manager" {
  name          = "dsy1107-romo3219801-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = ["http://localhost:5173"]
    allow_methods = ["GET", "OPTIONS"]
    allow_headers = ["authorization", "content-type"]
    max_age       = 300
  }
}

# Proxy HTTP publico hacia la API externa, sin rol IAM.
resource "aws_apigatewayv2_integration" "backend" {
  api_id                 = aws_apigatewayv2_api.api_manager.id
  integration_type       = "HTTP_PROXY"
  integration_method     = "GET"
  integration_uri        = "https://mindicador.cl/api"
  payload_format_version = "1.0"
}

# Autoriza el endpoint protegido con tokens JWT emitidos por Cognito.
resource "aws_apigatewayv2_authorizer" "cognito" {
  api_id           = aws_apigatewayv2_api.api_manager.id
  authorizer_type  = "JWT"
  identity_sources = ["$request.header.Authorization"]
  name             = "cognito-jwt"

  jwt_configuration {
    issuer   = "https://cognito-idp.us-east-1.amazonaws.com/${aws_cognito_user_pool.pool.id}"
    audience = [aws_cognito_user_pool_client.spa.id]
  }
}

# Ruta protegida para usuarios autenticados.
resource "aws_apigatewayv2_route" "datos" {
  api_id               = aws_apigatewayv2_api.api_manager.id
  route_key            = "GET /datos"
  target               = "integrations/${aws_apigatewayv2_integration.backend.id}"
  authorization_type   = "JWT"
  authorizer_id        = aws_apigatewayv2_authorizer.cognito.id
  authorization_scopes = ["openid"]
}

# Ruta publica para comparar el comportamiento sin autenticacion.
resource "aws_apigatewayv2_route" "publico_datos" {
  api_id    = aws_apigatewayv2_api.api_manager.id
  route_key = "GET /publico/datos"
  target    = "integrations/${aws_apigatewayv2_integration.backend.id}"
}

# El stage por defecto publica automaticamente los cambios de rutas.
resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.api_manager.id
  name        = "$default"
  auto_deploy = true
}
