# Namespace
kubectl create namespace app

# Envs
cd k8s/namespace/app || false
source ../../../.env.production

export FIREBASE_SERVICE_ACCOUNT POSTGRES_PORT POSTGRES_DB POSTGRES_USER DATABASE_URL
export GRAFANA_SECURITY_ADMIN_USER GRAFANA_SECURITY_ADMIN_PASSWORD POSTGRES_PASSWORD POSTGRES_ADMIN_PASSWORD

envsubst < config/app-secrets-template.yaml > config/app-secrets.yaml
envsubst < postgres/postgres-values-template.yaml > postgres/postgres-values.yaml
envsubst < postgres/postgres-secret-template.yaml > postgres/postgres-secret.yaml

# Secrets
kubectl apply -f config/app-config-map.yaml --namespace app
kubectl apply -f config/app-secrets.yaml --namespace app
kubectl apply -f postgres/postgres-secret.yaml --namespace app

# Postgres
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install -f postgres/postgres-values.yaml taskpad-postgres bitnami/postgresql --version 18.5.15 --namespace app
