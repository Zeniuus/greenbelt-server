#!/bin/bash
kubectl apply -f ./deploy/helm-chart/namespace.yaml
for chart in "sync-cronjob" "sync-server"; do
  helm upgrade --install -f "./deploy/helm-chart/$chart/values.yaml" "greenbelt-$chart" "./deploy/helm-chart/$chart"
done
