# Steps
kubectl get namespaces
kubectl create namespace app
kubectl apply -f config/app-config-map.yaml --namespace app

source ../../../.env.production
export POSTGRES_PORT POSTGRES_DB POSTGRES_USER POSTGRES_PASSWORD POSTGRES_ADMIN_PASSWORD
envsubst < postgres/postgres-secret-template.yaml > postgres/postgres-secret.yaml
envsubst < postgres/postgres-values-template.yaml > postgres/postgres-values.yaml
kubectl apply -f postgres/postgres-secret.yaml --namespace app

helm uninstall taskpad-postgres --namespace app
kubectl delete pvc postgres-data-taskpad-postgres-postgresql-0 --namespace app
kubectl delete pvc --namespace app -l app.kubernetes.io/instance=taskpad-postgres
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install -f postgres/postgres-values.yaml taskpad-postgres bitnami/postgresql --version 18.5.15 --namespace app

kubectl get pvc --namespace app
kubectl get pods --namespace app

source ../../../.env.production
export FIREBASE_SERVICE_ACCOUNT POSTGRES_PORT POSTGRES_DB POSTGRES_USER POSTGRES_URL
export GRAFANA_SECURITY_ADMIN_USER GRAFANA_SECURITY_ADMIN_PASSWORD POSTGRES_PASSWORD POSTGRES_ADMIN_PASSWORD
envsubst < config/app-secrets-template.yaml > config/app-secrets.yaml
kubectl apply -f config/app-secrets.yaml --namespace app
kubectl get pods --namespace app

kubectl apply -f deployment.yaml --namespace app
kubectl apply -f service.yaml --namespace app
kubectl get pods --namespace app

kubectl delete deployment taskpad-app --namespace app
kubectl delete hpa taskpad-app-hpa --namespace app
kubectl delete service taskpad-app-service --namespace app
