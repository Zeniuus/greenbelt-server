resource "aws_s3_bucket" "greenbelt_images" {
  bucket = "greenbelt-images"

  policy = <<EOT
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": [
        "s3:GetObject"
      ],
      "Resource": "arn:aws:s3:::greenbelt-images/*"
    }
  ]
}
EOT
}
