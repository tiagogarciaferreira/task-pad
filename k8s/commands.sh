# AWS
aws login
aws eks update-kubeconfig --region us-east-1 --name taskpad-cluster

# Namespace
kubectl get namespaces
kubectl create namespace app
kubectl create namespace monitoring

# Cluster
kubectl apply -f cluster/storage-class.yaml
kubectl apply -f cluster/rbac.yaml
