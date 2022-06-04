#data "aws_iam_policy_document" allow_assume_role_from_ecs {
#  version = "2012-10-17"
#  statement {
#    sid     = ""
#    effect  = "Allow"
#    actions = ["sts:AssumeRole"]
#
#    principals {
#      type        = "Service"
#      identifiers = ["ecs-tasks.amazonaws.com"]
#    }
#  }
#}
#
#
#resource "aws_iam_role" ecs_task_execution_role {
#  name               = "greenbelt-cron-ecs-execution-role"
#  assume_role_policy = data.aws_iam_policy_document.allow_assume_role_from_ecs.json
#}
#
#resource "aws_iam_role_policy_attachment" ecs_task_execution_role {
#  role       = aws_iam_role.ecs_task_execution_role.name
#  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
#}
#
#resource "aws_iam_role_policy" ecs_task_execution_role_s3 {
#  role   = aws_iam_role.ecs_task_execution_role.id
#  policy = <<EOT
#{
#  "Version":"2012-10-17",
#  "Statement":[
#    {
#      "Action": [
#        "s3:*"
#      ],
#      "Effect": "Allow",
#      "Resource": "${aws_s3_bucket.greenbelt_images.arn}/*"
#    }
#  ]
#}
#EOT
#}
#
##resource "aws_ecs_service" server {
##  name = "greenbelt-cron"
##  cluster = aws_ecs_cluster.prod.id
##  task_definition = aws_ecs_task_definition.server.arn
##  desired_count = 1
##  launch_type = "FARGATE"
##
##  network_configuration {
##    security_groups = [aws_security_group.server.id]
##    subnets = var.default_vpc_subnet_ids
##    assign_public_ip = true
##  }
##}
#
#resource "aws_ecs_task_definition" server {
#  family = "greenbelt-cron"
#  requires_compatibilities = ["FARGATE"]
#  network_mode = "awsvpc"
#  execution_role_arn = aws_iam_role.ecs_task_execution_role.arn
#  cpu = 256
#  memory = 2048
#  container_definitions = <<EOT
#[
#  {
#    "name": "greenbelt-cron",
#    "image": "563057296362.dkr.ecr.ap-northeast-2.amazonaws.com/greenbelt-cron:latest",
#    "cpu": 256,
#    "memory": 2048,
#    "essential": true,
#    "portMappings": [],
#    "logConfiguration": {
#      "logDriver": "awslogs",
#      "options": {
#        "awslogs-group": "greenbelt-cron",
#        "awslogs-region": "ap-northeast-2",
#        "awslogs-stream-prefix": "ecs"
#      }
#    }
#  }
#]
#EOT
#
#  runtime_platform {
#    operating_system_family = "LINUX"
#    cpu_architecture        = "X86_64"
#  }
#}
#
#resource "aws_cloudwatch_log_group" server {
#  name = "greenbelt-cron"
#}
#
#resource "aws_security_group" server {
#  vpc_id = data.aws_vpc.default.id
#  name = "greenbelt-cron-sg"
#}
#
#resource "aws_security_group_rule" server_egress_all {
#  security_group_id = aws_security_group.server.id
#  type              = "egress"
#  protocol          = "-1"
#  from_port         = 0
#  to_port           = 0
#  cidr_blocks       = ["0.0.0.0/0"]
#}
#
#resource "aws_security_group_rule" db_ingress_server {
#  security_group_id = var.db_security_group_id
#  type              = "ingress"
#  protocol          = "tcp"
#  from_port         = 3306
#  to_port           = 3306
#  source_security_group_id = aws_security_group.server.id
#}
#
#variable "db_security_group_id" {
#  default = "sg-0736e281337244ace"
#}
