# AWS
aws login
aws eks update-kubeconfig --region us-east-1 --name taskpad-cluster

# Namespace
kubectl get namespaces
kubectl create namespace app
kubectl create namespace monitoring

# Storage Class
kubectl get storageclass
kubectl apply -f storage/storage-class.yaml
kubectl get storageclass
