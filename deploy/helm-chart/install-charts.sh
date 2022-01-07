#!/bin/bash
for chart in 'profile-page-syncer':
  helm upgrade --install -f "./deploy/helm-chart/$chart/values.yaml" "greenbelt-$chart" "./deploy/helm-chart/$chart"
