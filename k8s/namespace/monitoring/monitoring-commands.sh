# Namespace
kubectl create namespace monitoring

# Envs
cd k8s/namespace/monitoring || false
source ../../../.env.production

export GRAFANA_SECURITY_ADMIN_USER GRAFANA_SECURITY_ADMIN_PASSWORD
envsubst < prometheus/prometheus-values-template.yaml > prometheus/prometheus-values.yaml
envsubst < grafana/grafana-secret-template.yaml > grafana/grafana-secret.yaml
envsubst < grafana/grafana-values-template.yaml > grafana/grafana-values.yaml

# Secrets
kubectl apply -f grafana/grafana-secret.yaml --namespace monitoring

# Prometheus
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install -f prometheus/prometheus-values.yaml taskpad-prometheus prometheus-community/prometheus --version 29.2.0 --namespace monitoring
helm upgrade -f prometheus/prometheus-values.yaml taskpad-prometheus prometheus-community/prometheus --version 29.2.0 --namespace monitoring

kubectl get pvc --namespace monitoring
kubectl get pods --namespace monitoring

# Grafana
helm repo add grafana-community https://grafana-community.github.io/helm-charts/
helm install -f grafana/grafana-values.yaml taskpad-grafana grafana-community/grafana --version 11.6.0 --namespace monitoring
helm upgrade -f grafana/grafana-values.yaml taskpad-grafana grafana-community/grafana --version 11.6.0 --namespace monitoring

# taskpad-prometheus-server.monitoring.svc.cluster.local:80
# kubectl port-forward -n monitoring svc/taskpad-prometheus-server 9090:80
