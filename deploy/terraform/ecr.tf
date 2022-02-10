resource "aws_ecr_repository" "greenbelt_cron" {
  name                 = "greenbelt-cron"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}
