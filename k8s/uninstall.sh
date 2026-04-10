#!/bin/bash

helm uninstall taskpad-prometheus --namespace monitoring
helm uninstall taskpad-grafana --namespace monitoring
helm uninstall taskpad-postgres --namespace app

kubectl delete -f namespace/app/deployment.yaml --namespace app --ignore-not-found
kubectl delete -f namespace/app/service.yaml --namespace app --ignore-not-found
kubectl delete -f namespace/app/config/app-secrets.yaml --namespace app --ignore-not-found
kubectl delete -f namespace/app/config/app-config-map.yaml --namespace app --ignore-not-found
kubectl delete -f namespace/app/postgres/postgres-secret.yaml --namespace app --ignore-not-found

kubectl delete -f namespace/monitoring/grafana/grafana-secret.yaml --namespace monitoring --ignore-not-found

kubectl delete pvc --all --namespace app
kubectl delete pvc --all --namespace monitoring

kubectl delete namespace app
kubectl delete namespace monitoring

aws eks delete-cluster --name taskpad-cluster --region us-east-1
