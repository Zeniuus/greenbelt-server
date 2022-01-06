#!/bin/bash

aws ecr get-login-password --region ap-northeast-2 | docker login --username AWS --password-stdin 563057296362.dkr.ecr.ap-northeast-2.amazonaws.com
docker build . -f deploy/docker/Dockerfile -t 563057296362.dkr.ecr.ap-northeast-2.amazonaws.com/greenbelt-profile-page-syncer:latest
docker push 563057296362.dkr.ecr.ap-northeast-2.amazonaws.com/greenbelt-profile-page-syncer:latest
