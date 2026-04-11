# Namespace
kubectl create namespace monitoring

# Envs
cd k8s/namespace/monitoring || false
source ../../../.env.production

export PROMETHEUS_PORT GRAFANA_SECURITY_ADMIN_USER GRAFANA_SECURITY_ADMIN_PASSWORD GRAFANA_PORT
envsubst < prometheus/prometheus-values-template.yaml > prometheus/prometheus-values.yaml
envsubst < grafana/grafana-secret-template.yaml > grafana/grafana-secret.yaml
envsubst < grafana/grafana-values-template.yaml > grafana/grafana-values.yaml

# Secrets
kubectl apply -f grafana/grafana-secret.yaml --namespace monitoring

# Prometheus
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install -f prometheus/prometheus-values.yaml taskpad-prometheus pbitnami/prometheus --version 2.1.23 --namespace monitoring

# Grafana
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install -f grafana/grafana-values.yaml taskpad-grafana bitnami/grafana --version 12.1.8 --namespace monitoring
