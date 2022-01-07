resource "aws_ecr_repository" "server" {
  name                 = "greenbelt-server"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}
