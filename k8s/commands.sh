# AWS
aws login
aws eks update-kubeconfig --region us-east-1 --name taskpad-cluster

# Namespace
kubectl get namespaces
kubectl create namespace app
kubectl create namespace monitoring

# Storage Class
kubectl get storageclass
kubectl apply -f storage-class.yaml
kubectl patch storageclass gp2 -p '{"metadata":{"annotations":{"storageclass.kubernetes.io/is-default-class":"false"}}}'
kubectl patch storageclass gp3 -p '{"metadata":{"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'
