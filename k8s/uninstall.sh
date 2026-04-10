#!/bin/bash

# 1. Uninstall Helm charts
helm uninstall taskpad-prometheus --namespace monitoring
helm uninstall taskpad-grafana --namespace monitoring
helm uninstall taskpad-postgres --namespace app

# 2. Delete Kubernetes resources
kubectl delete -f k8s/namespace/app/deployment.yaml --namespace app --ignore-not-found
kubectl delete -f k8s/namespace/app/service.yaml --namespace app --ignore-not-found
kubectl delete -f k8s/namespace/app/config/app-secrets.yaml --namespace app --ignore-not-found
kubectl delete -f k8s/namespace/app/config/app-config-map.yaml --namespace app --ignore-not-found
kubectl delete -f k8s/namespace/app/postgres/postgres-secret.yaml --namespace app --ignore-not-found
kubectl delete -f k8s/namespace/monitoring/grafana/grafana-secret.yaml --namespace monitoring --ignore-not-found

kubectl delete deployment taskpad-app --namespace app --ignore-not-found
kubectl delete hpa taskpad-app-hpa --namespace app --ignore-not-found
kubectl delete service taskpad-app-service --namespace app --ignore-not-found

# 3. Delete PVCs
kubectl delete pvc --all --namespace app
kubectl delete pvc --all --namespace monitoring

# 4. Delete namespaces
kubectl delete namespace app
kubectl delete namespace monitoring

# 5. Delete EKS cluster
# aws eks delete-cluster --name taskpad-cluster --region us-east-1
