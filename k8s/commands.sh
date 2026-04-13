#!/bin/bash

aws login
aws eks update-kubeconfig --region us-east-1 --name taskpad-cluster

kubectl create namespace app
kubectl create namespace monitoring
kubectl apply -f cluster/cluster-configs.yaml

# Namespace app
kubectl apply -f namespace/app/config/app-config-map.yaml --namespace app

source ../.env.production
export POSTGRES_PORT POSTGRES_DB POSTGRES_USER POSTGRES_PASSWORD POSTGRES_ADMIN_PASSWORD
envsubst < namespace/app/postgres/postgres-secret-template.yaml > namespace/app/postgres/postgres-secret.yaml
envsubst < namespace/app/postgres/postgres-values-template.yaml > namespace/app/postgres/postgres-values.yaml

kubectl apply -f namespace/app/postgres/postgres-secret.yaml --namespace app
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install -f namespace/app/postgres/postgres-values.yaml taskpad-postgres bitnami/postgresql --version 18.5.15 --namespace app

kubectl get svc taskpad-postgres-postgresql -n app -o jsonpath='{.metadata.name}.{.metadata.namespace}.svc.cluster.local:{.spec.ports[0].port}{"\n"}'
echo "You must update the env POSTGRES_URL_AWS_EKS in .env.production"

bash ../certs/generate.sh

source ../.env.production
export FIREBASE_SERVICE_ACCOUNT POSTGRES_PORT POSTGRES_DB POSTGRES_USER TLS_CRT TLS_KEY POSTGRES_URL_AWS_EKS
export GRAFANA_SECURITY_ADMIN_USER GRAFANA_SECURITY_ADMIN_PASSWORD POSTGRES_PASSWORD POSTGRES_ADMIN_PASSWORD
envsubst < namespace/app/config/app-secrets-template.yaml > namespace/app/config/app-secrets.yaml
envsubst < namespace/app/config/app-tls-secret-template.yaml > namespace/app/config/app-tls-secret.yaml

kubectl apply -f namespace/app/config/app-secrets.yaml --namespace app
kubectl apply -f namespace/app/config/app-tls-secret.yaml --namespace app
kubectl apply -f namespace/app/deployment.yaml --namespace app

kubectl get pods --namespace app
kubectl get svc --namespace app
kubectl get pvc --namespace app

# Namespace monitoring
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install -f namespace/monitoring/prometheus/prometheus-values.yaml taskpad-prometheus prometheus-community/prometheus --version 29.2.0 --namespace monitoring

kubectl get svc taskpad-prometheus-server -n monitoring -o jsonpath='{.metadata.name}.{.metadata.namespace}.svc.cluster.local:{.spec.ports[0].port}{"\n"}'
echo "You must update the env PROMETHEUS_URL_AWS_EKS in .env.production"

source ../.env.production
export GRAFANA_SECURITY_ADMIN_USER GRAFANA_SECURITY_ADMIN_PASSWORD PROMETHEUS_URL_AWS_EKS
envsubst < namespace/monitoring/grafana/grafana-secret-template.yaml > namespace/monitoring/grafana/grafana-secret.yaml
envsubst < namespace/monitoring/grafana/grafana-values-template.yaml > namespace/monitoring/grafana/grafana-values.yaml

kubectl create configmap monitoring-config-map \
  --from-file=taskpad-dashboard-metrics.json=namespace/monitoring/grafana/TaskPad-Dashboard-Metrics.json \
  --namespace monitoring \
  --dry-run=client -o yaml > namespace/monitoring/config/monitoring-config-map.yaml

kubectl apply -f namespace/monitoring/config/monitoring-config-map.yaml --namespace monitoring
kubectl apply -f namespace/monitoring/grafana/grafana-secret.yaml --namespace monitoring

helm repo add grafana-community https://grafana-community.github.io/helm-charts/
helm install -f namespace/monitoring/grafana/grafana-values.yaml taskpad-grafana grafana-community/grafana --version 11.6.0 --namespace monitoring

# Commands check
kubectl get pods --namespace monitoring
kubectl get svc --namespace monitoring
kubectl get pvc --namespace monitoring
