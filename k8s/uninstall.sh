#!/bin/bash

# 💀☠️🔥⚠️💣💥🔴⛔🚫❌ -> 💀☠️🔥⚠️💣💥🔴⛔🚫❌ -> 💀☠️🔥⚠️💣💥🔴⛔🚫❌

set -euo pipefail

echo "🔐 Updating kubeconfig..."
aws eks update-kubeconfig --region us-east-1 --name taskpad-cluster

echo "🧹 Starting cleanup..."

# =========================
# 1. Uninstall Helm releases
# =========================
echo "📦 Removing Helm releases..."

helm uninstall taskpad-prometheus --namespace monitoring || true
helm uninstall taskpad-grafana --namespace monitoring || true
helm uninstall taskpad-postgres --namespace app || true

# =========================
# 2. Delete Kubernetes resources (APP)
# =========================
echo "🧩 Deleting app resources..."

kubectl delete -f namespace/app/deployment.yaml --namespace app --ignore-not-found
kubectl delete -f namespace/app/config/app-secrets.yaml --namespace app --ignore-not-found
kubectl delete -f namespace/app/config/app-tls-secret.yaml --namespace app --ignore-not-found
kubectl delete -f namespace/app/config/app-config-map.yaml --namespace app --ignore-not-found
kubectl delete -f namespace/app/postgres/postgres-secret.yaml --namespace app --ignore-not-found

kubectl delete deployment taskpad-app --namespace app --ignore-not-found
kubectl delete service taskpad-app-service --namespace app --ignore-not-found
kubectl delete hpa taskpad-app-hpa --namespace app --ignore-not-found

# =========================
# 3. Delete Monitoring resources
# =========================
echo "📊 Deleting monitoring resources..."

kubectl delete -f namespace/monitoring/config/monitoring-config-map.yaml --namespace monitoring --ignore-not-found
kubectl delete -f namespace/monitoring/grafana/grafana-secret.yaml --namespace monitoring --ignore-not-found

# =========================
# 4. Delete PVCs
# =========================
echo "💾 Deleting persistent volumes..."

kubectl delete pvc --all --namespace app || true
kubectl delete pvc --all --namespace monitoring || true

# =========================
# 5. Delete namespaces
# =========================
echo "🗑️ Deleting namespaces..."

kubectl delete namespace app --ignore-not-found
kubectl delete namespace monitoring --ignore-not-found

echo "⏳ Waiting for namespaces to terminate..."
kubectl wait --for=delete namespace/app --timeout=120s || true
kubectl wait --for=delete namespace/monitoring --timeout=120s || true

# =========================
# 6. Delete EKS Cluster
# =========================
echo "☁️ Deleting EKS cluster..."

aws eks delete-cluster --name taskpad-cluster --region us-east-1 || true

echo "✅ Cleanup finished successfully!"
