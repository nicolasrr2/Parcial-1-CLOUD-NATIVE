terraform {
  required_version = ">= 1.15.8"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Configuracion del proveedor para la region del laboratorio.
provider "aws" {
  region = "us-east-1"
}
