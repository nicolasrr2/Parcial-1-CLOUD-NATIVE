# Grupo de usuarios para autenticar la aplicacion React.
resource "aws_cognito_user_pool" "pool" {
  name                = "dsy1107-romo3219801"
  username_attributes = ["email"]

  auto_verified_attributes = ["email"]

  password_policy {
    minimum_length                   = 8
    require_lowercase                = true
    require_uppercase                = true
    require_numbers                  = true
    require_symbols                  = false
    temporary_password_validity_days = 7
  }

  admin_create_user_config {
    allow_admin_create_user_only = true
  }
}

# Dominio clasico de Hosted UI de Cognito.
resource "aws_cognito_user_pool_domain" "domain" {
  domain                = "dsy1107-romo3219801"
  user_pool_id          = aws_cognito_user_pool.pool.id
  managed_login_version = 1
}

# Cliente publico para el navegador; no almacena un secreto.
resource "aws_cognito_user_pool_client" "spa" {
  name         = "spa-react"
  user_pool_id = aws_cognito_user_pool.pool.id

  generate_secret                      = false
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_flows                  = ["code"]
  supported_identity_providers         = ["COGNITO"]
  allowed_oauth_scopes                 = ["openid", "email", "profile", "aws.cognito.signin.user.admin"]

  callback_urls = ["http://localhost:5173/"]
  logout_urls   = ["http://localhost:5173/"]

  access_token_validity  = 60
  id_token_validity      = 60
  refresh_token_validity = 1

  token_validity_units {
    access_token  = "minutes"
    id_token      = "minutes"
    refresh_token = "days"
  }
}
