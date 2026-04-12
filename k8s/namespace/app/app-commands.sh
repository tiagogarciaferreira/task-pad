# Steps
kubectl get namespaces
kubectl create namespace app
kubectl apply -f config/app-config-map.yaml --namespace app

source ../../../.env.production
export POSTGRES_PORT POSTGRES_DB POSTGRES_USER POSTGRES_PASSWORD POSTGRES_ADMIN_PASSWORD
envsubst < postgres/postgres-secret-template.yaml > postgres/postgres-secret.yaml
envsubst < postgres/postgres-values-template.yaml > postgres/postgres-values.yaml
kubectl apply -f postgres/postgres-secret.yaml --namespace app

helm repo add bitnami https://charts.bitnami.com/bitnami
helm install -f postgres/postgres-values.yaml taskpad-postgres bitnami/postgresql --version 18.5.15 --namespace app

kubectl get pvc --namespace app
kubectl get pods --namespace app

source ../../../.env.production
export POSTGRES_PORT POSTGRES_DB POSTGRES_USER POSTGRES_URL_AWS_EKS POSTGRES_PASSWORD POSTGRES_ADMIN_PASSWORD
export GRAFANA_SECURITY_ADMIN_USER GRAFANA_SECURITY_ADMIN_PASSWORD TLS_CRT TLS_KEY

envsubst < config/app-secrets-template.yaml > config/app-secrets.yaml
envsubst < config/app-tls-secret-template.yaml > config/app-tls-secret.yaml

kubectl apply -f config/app-secrets.yaml --namespace app
kubectl apply -f config/app-tls-secret.yaml --namespace app
kubectl get pods --namespace app

kubectl apply -f deployment.yaml --namespace app
kubectl apply -f service.yaml --namespace app
kubectl get pods --namespace app
