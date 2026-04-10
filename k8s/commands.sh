# AWS
aws login
aws eks update-kubeconfig --region us-east-1 --name taskpad-cluster

# Namespace
kubectl get namespaces
kubectl create namespace app
kubectl create namespace monitoring

# Storage Class
kubectl apply -f storage/storage-class.yaml
kubectl get storageclass

kubectl delete deployment taskpad-app --namespace app
kubectl delete hpa taskpad-app-hpa --namespace app
kubectl delete service taskpad-app-service --namespace app
