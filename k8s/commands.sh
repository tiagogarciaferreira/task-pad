#!/bin/bash

# ============================================
# 🔐 Autenticação na AWS e configuração do EKS
# ============================================
# Realiza login na AWS CLI
aws login

# Atualiza o kubeconfig para conectar ao cluster EKS
aws eks update-kubeconfig --region us-east-1 --name taskpad-cluster


# ============================================
# 📦 Criação de namespaces e configurações base
# ============================================
# Cria namespaces para aplicação e monitoramento
kubectl create namespace app
kubectl create namespace monitoring

# Aplica configurações gerais do cluster
kubectl apply -f cluster/cluster-configs.yaml


# ============================================
# ⚙️ Configuração inicial da aplicação (ConfigMap)
# ============================================
# Aplica configurações da aplicação no namespace app
kubectl apply -f namespace/app/config/app-config-map.yaml --namespace app


# ============================================
# 🐘 Configuração do PostgreSQL (Secrets + Values)
# ============================================
# Carrega variáveis de ambiente de produção
source ../.env.production

# Exporta variáveis necessárias para substituição nos templates
export POSTGRES_PORT POSTGRES_DB POSTGRES_USER POSTGRES_PASSWORD POSTGRES_ADMIN_PASSWORD

# Gera arquivos finais a partir dos templates usando envsubst
envsubst < namespace/app/postgres/postgres-secret-template.yaml > namespace/app/postgres/postgres-secret.yaml
envsubst < namespace/app/postgres/postgres-values-template.yaml > namespace/app/postgres/postgres-values.yaml

# Aplica secret do PostgreSQL no cluster
kubectl apply -f namespace/app/postgres/postgres-secret.yaml --namespace app

# Adiciona repositório Helm do Bitnami
helm repo add bitnami https://charts.bitnami.com/bitnami

# Instala PostgreSQL via Helm Chart
helm install -f namespace/app/postgres/postgres-values.yaml taskpad-postgres bitnami/postgresql --version 18.5.15 --namespace app


# ============================================
# 🔎 Recuperação da URL do PostgreSQL
# ============================================
# Obtém endpoint interno do serviço PostgreSQL
kubectl get svc taskpad-postgres-postgresql -n app -o jsonpath='{.metadata.name}.{.metadata.namespace}.svc.cluster.local:{.spec.ports[0].port}{"\n"}'

# Instrução manual para atualização da variável de ambiente
echo "You must update the env POSTGRES_URL_AWS_EKS in .env.production"


# ============================================
# 🔐 Geração de certificados TLS
# ============================================
# Executa script de geração de certificados
bash ../certs/generate.sh


# ============================================
# 🔑 Configuração de Secrets da aplicação
# ============================================
# Recarrega variáveis de ambiente
source ../.env.production

# Exporta variáveis necessárias (DB, Firebase, TLS, Grafana)
export FIREBASE_SERVICE_ACCOUNT POSTGRES_PORT POSTGRES_DB POSTGRES_USER TLS_CRT TLS_KEY POSTGRES_URL_AWS_EKS
export GRAFANA_SECURITY_ADMIN_USER GRAFANA_SECURITY_ADMIN_PASSWORD POSTGRES_PASSWORD POSTGRES_ADMIN_PASSWORD

# Gera arquivos finais a partir dos templates
envsubst < namespace/app/config/app-secrets-template.yaml > namespace/app/config/app-secrets.yaml
envsubst < namespace/app/config/app-tls-secret-template.yaml > namespace/app/config/app-tls-secret.yaml

# Aplica secrets no cluster
kubectl apply -f namespace/app/config/app-secrets.yaml --namespace app
kubectl apply -f namespace/app/config/app-tls-secret.yaml --namespace app

# Realiza deploy da aplicação
kubectl apply -f namespace/app/deployment.yaml --namespace app


# ============================================
# 📊 Verificação de recursos da aplicação
# ============================================
kubectl get pods --namespace app
kubectl get svc --namespace app
kubectl get pvc --namespace app


# ============================================
# 📈 Instalação do Prometheus (monitoramento)
# ============================================
# Adiciona repositório do Prometheus
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts

# Instala Prometheus via Helm
helm install -f namespace/monitoring/prometheus/prometheus-values.yaml taskpad-prometheus prometheus-community/prometheus --version 29.2.0 --namespace monitoring


# ============================================
# 🔎 Recuperação da URL do Prometheus
# ============================================
kubectl get svc taskpad-prometheus-server -n monitoring -o jsonpath='{.metadata.name}.{.metadata.namespace}.svc.cluster.local:{.spec.ports[0].port}{"\n"}'

# Instrução manual para atualização da variável
echo "You must update the env PROMETHEUS_URL_AWS_EKS in .env.production"


# ============================================
# 📊 Configuração do Grafana
# ============================================
# Carrega variáveis de ambiente necessárias
source ../.env.production

# Exporta variáveis do Grafana
export GRAFANA_SECURITY_ADMIN_USER GRAFANA_SECURITY_ADMIN_PASSWORD PROMETHEUS_URL_AWS_EKS

# Gera arquivos a partir dos templates
envsubst < namespace/monitoring/grafana/grafana-secret-template.yaml > namespace/monitoring/grafana/grafana-secret.yaml
envsubst < namespace/monitoring/grafana/grafana-values-template.yaml > namespace/monitoring/grafana/grafana-values.yaml

# Cria ConfigMap com dashboards customizados
kubectl create configmap monitoring-config-map \
  --from-file=taskpad-dashboard-metrics.json=namespace/monitoring/grafana/TaskPad-Dashboard-Metrics.json \
  --namespace monitoring \
  --dry-run=client -o yaml > namespace/monitoring/config/monitoring-config-map.yaml

# Aplica configurações do Grafana
kubectl apply -f namespace/monitoring/config/monitoring-config-map.yaml --namespace monitoring
kubectl apply -f namespace/monitoring/grafana/grafana-secret.yaml --namespace monitoring

# Adiciona repositório do Grafana
helm repo add grafana-community https://grafana-community.github.io/helm-charts/

# Instala Grafana via Helm
helm install -f namespace/monitoring/grafana/grafana-values.yaml taskpad-grafana grafana-community/grafana --version 11.6.0 --namespace monitoring


# ============================================
# 📊 Verificação de recursos de monitoramento
# ============================================
kubectl get pods --namespace monitoring
kubectl get svc --namespace monitoring
kubectl get pvc --namespace monitoring
