terraform {
  backend "s3" {
    bucket = "suhwan.dev-terraform-backend"
    key    = "greenbelt-ecs"
    region = "ap-northeast-2"
  }
}
