locals {
  oidc_provider = "oidc.eks.ap-northeast-2.amazonaws.com/id/6670281CEAB7FEF8573F489C02563F18"
}

resource "aws_iam_policy" "greenbelt_sync_server" {
  name        = "greenbelt-sync-server"
  description = "greenbelt-sync-server policy"

  policy = <<EOT
{
  "Version":"2012-10-17",
  "Statement":[
    {
      "Action": [
        "s3:*"
      ],
      "Effect": "Allow",
      "Resource": "${aws_s3_bucket.greenbelt_images.arn}/*"
    }
  ]
}
EOT
}

resource "aws_iam_role" "greenbelt_sync_server" {
  name = "greenbelt-sync-server"

  assume_role_policy = <<EOT
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::563057296362:oidc-provider/${local.oidc_provider}"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "${local.oidc_provider}:sub": "system:serviceaccount:greenbelt:greenbelt-sync-server"
        }
      }
    }
  ]
}
EOT
}

resource "aws_iam_role_policy_attachment" "greenbelt_sync_server" {
  role       = aws_iam_role.greenbelt_sync_server.name
  policy_arn = aws_iam_policy.greenbelt_sync_server.arn
}
