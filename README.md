🚀 Task Manager (Task Pad)

Aplicação web fullstack que implementa um gerenciador de tarefas simples, desenvolvida como parte da disciplina de:

**Integração Contínua, DevOps e Computação em Nuvem**

Requisitos do projeto:  
[https://github.com/tiagogarciaferreira/task-pad/blob/main/project.md](https://github.com/tiagogarciaferreira/task-pad/blob/main/project.md)

## 🧱 Stack Tecnológica

**Aplicação:**
- Angular (Angular CLI)
- Node.js

**Banco de Dados:**
- PostgreSQL
- Drizzle ORM

**Observabilidade:**
- Prometheus
- Grafana

**Containerização e Segurança:**
- Docker
- Docker Compose
- Cosign
- Dive

**Cloud:**
- AWS (Free Tier)
- EKS
- Helm
- kubectl
- AWS CLI

**CI/CD:**
- GitHub
- GitHub Actions (OIDC + Assume Role)

**Outros:**
- Firebase (Auth)
- OpenSSL
- k6
- Makefile

## 🚀 Setup Inicial

### 📥 Clonar o repositório

   ```bash
git clone https://github.com/tiagogarciaferreira/task-pad.git  
cd task-pad
   ```

### ⚙️ Instalar dependências

   ```bash
npm install
   ```

### 🏗️ Build da aplicação (desenvolvimento)

   ```bash
npm run build:dev
   ```

### ▶️ Executar a aplicação (modo desenvolvimento)

   ```bash
npm run dev
   ```

## 🐳 Alternativa com Docker (Makefile)

### ▶️ Execução completa

Para executar toda a stack (build + subida dos containers):

   ```bash
make full
   ```

### ⚙️ O que o comando faz

O comando `make full` deve orquestrar:

- Build das imagens Docker
- Subida dos serviços via Docker Compose

### 🌐 Ambiente utilizado

Neste caso **específico**, o ambiente padrão será: **.env.production**

> Certifique-se de que todas as variáveis estejam corretamente configuradas antes da execução.
> O uso do Makefile simplifica o fluxo e padroniza a execução do ambiente completo.

## 🔐 Firebase

### Criar projetos

Acesse: [https://console.firebase.google.com/](https://console.firebase.google.com/)

Crie **dois projetos**:
- `task-pad-dev`
- `task-pad-prod`

### Ativar autenticação com Google

**Caminho:**  
Firebase Console → Authentication → Sign-in method → Google

**Passos:**
1. Habilitar provider Google
2. Definir e-mail de suporte

### Criar Service Account

**Caminho:**  
Firebase Console → Project Settings (ícone de engrenagem) → Service Accounts

**Passos:**
1. Clique em **"Generate new private key"**
2. Baixar o JSON
3. Converter JSON para Base64:
   ```bash
   base64 service-account.json
   ```

### Converter JSON para Base64

Para converter o arquivo de credenciais do Firebase, utilize o comando abaixo no seu terminal:
  ```bash
  base64 service-account.json
  ```
### Configurar no .env

A string gerada deve ser inserida nos arquivos de configuração de ambiente correspondentes:

**Arquivos:** `.env.development` / `.env.production`

**Variável:**
FIREBASE_SERVICE_ACCOUNT=<BASE64>

## 📁 Configuração de Ambientes Firebase

**Caminho:**  
`src/environments/`

**Arquivos:**
- `environment.template.ts` (base)
- `environment.ts` (dev)
- `environment.production.ts` (prod)

> **Nota:** Todos os arquivos devem seguir rigorosamente o padrão definido no template.

## 🔐 Firebase — Liberação de IPs (EKS)

Para que a aplicação em execução no EKS consiga se autenticar corretamente com o Firebase (especialmente em cenários com restrições de segurança), é necessário garantir a liberação dos endpoints e domínios utilizados.

### 🌍 Liberar domínio da aplicação

#### 📍 Caminho:

Firebase Console → Authentication → Settings → Authorized domains

#### ➕ Adicionar:

- URL pública da aplicação (IP público ou DNS do LoadBalancer/NodePort)

> Sem essa configuração, o fluxo de autenticação pode ser bloqueado pelo Firebase.

---

### 🔍 Obtenção dos IPs dos nodes do EKS

Para listar os nodes e seus respectivos IPs:

  ```bash
kubectl get nodes -o wide
  ```

#### 📌 Saída esperada:

- **EXTERNAL-IP** → IP público do node
- **INTERNAL-IP** → IP interno da VPC

> Utilize preferencialmente o DNS do LoadBalancer em vez de IP direto, sempre que disponível.
> Em ambientes produtivos, evite exposição direta via NodePort quando possível.

## ⚙️ Variáveis de Ambiente

Na raiz do projeto, gerencie os arquivos de configuração conforme os ambientes:

- `.env.template` (Modelo de referência)
- `.env.development` (Ambiente de desenvolvimento)
- `.env.production` (Ambiente de produção)

> **Nota:** Todos os arquivos devem seguir rigorosamente o padrão definido no template.

### 🔑 Configuração do Firebase

Para configurar a conta de serviço, realize a conversão do arquivo JSON para Base64:

**Converter JSON para Base64:**
  ```bash
  base64 service-account.json
  ```

**Configurar no .env:**
Adicione o resultado nos arquivos `.env.development` ou `.env.production`:
FIREBASE_SERVICE_ACCOUNT=<BASE64>

## 🐳 Docker Hub

### 🌐 Criação de conta

É necessário possuir uma conta no Docker Hub:

https://hub.docker.com/

### 🔐 Geração de Access Token

#### 📍 Caminho:

Docker Hub → Account Settings → Security → New Access Token

#### ⚙️ Passos:

- Criar um token com permissão de leitura e escrita
- Copiar e armazenar o valor gerado com segurança

> Utilize o token no lugar da senha em integrações com CI/CD.
> Nunca exponha o token em código-fonte ou repositórios públicos.

### 🎯 Finalidade

O Access Token do Docker Hub será utilizado no pipeline de CI/CD para:

- Autenticação (login) no Docker Hub
- Push das imagens Docker geradas durante o build

> Recomenda-se utilizar o token via secrets no GitHub Actions para garantir segurança e evitar exposição de credenciais.

## 🐳 Docker

### ▶️ Execução

Para subir toda a aplicação utilizando containers:

```bash
make full
```

### ⚙️ Ambiente

O Docker Compose está configurado para utilizar automaticamente o arquivo: **.env.production**

> Certifique-se de que o arquivo `.env.production` esteja devidamente configurado antes da execução.

## 🔏 Cosign (Assinatura de Imagens)

### ▶️ Geração de chaves

Execute os comandos abaixo dentro da pasta `.cosign` para gerar o par de chaves:

```bash
mkdir -p .cosign && cd .cosign  
cosign generate-key-pair
  ```

### 📁 Arquivos gerados

Após a execução, serão criados os seguintes arquivos:

- cosign.key
- cosign.pub

### 🔐 Armazenamento seguro

#### GitHub (CI/CD)

Armazene as chaves como secrets no repositório:

Settings → Secrets → Actions

## 🔐 Certificados SSL

### ▶️ Geração dos certificados

Execute os comandos abaixo dentro da pasta `certs`:

#### ⚙️ Configuração do openssl.conf

O arquivo `openssl.conf` deve conter os IPs dos nodes do cluster EKS para garantir a validade do certificado.

#### Exemplo:

[ alt_names ]  
IP.1 = <NODE_IP_1>  
IP.2 = <NODE_IP_2>

> Substitua os valores pelos IPs reais dos nodes do seu cluster.

```bash
bash ../certs/generate.sh
  ```

### 📁 Arquivos gerados

Após a execução, serão criados os seguintes arquivos:

- key.pem
- cert.pem

> Garanta que os arquivos de chave não sejam versionados no repositório.

## 🔄 Conversão para Base64

### ▶️ Conversão dos arquivos

Os certificados gerados devem ser convertidos para Base64 para utilização em variáveis de ambiente:

```bash
base64 key.pem  
base64 cert.pem
  ```

### ⚙️ Configuração nos arquivos `.env`

Adicione os valores convertidos nos seguintes arquivos:

- `.env.development`
- `.env.production`

#### 🔐 Variáveis:

TLS_KEY=<BASE64_KEY>  
TLS_CRT=<BASE64_CERT>

> Garanta que os valores estejam corretamente formatados em uma única linha.
> Evite versionar arquivos sensíveis ou valores reais no repositório.

## ☁️ AWS EKS

### 🚀 Criação do Cluster

O cluster foi criado via console da AWS:

AWS Console → EKS → Create Cluster

### ⚙️ Configuração

- Utilizado modo padrão (default)
- Sem customizações avançadas

### 🔓 Liberação de Portas (NodePort)

Após o deploy da aplicação e do Grafana, é necessário liberar as portas no Security Group associado ao cluster ou node group.

#### 📍 Caminho:

AWS Console → EC2 → Security Groups → Selecionar SG do cluster/node group

#### ➕ Adicionar regra:

- Tipo: Custom TCP
- Porta: (NodePort do serviço)
- Source: 0.0.0.0/0 *(ou restringir conforme necessário)*

> Para ambientes produtivos, recomenda-se restringir o acesso por IP para aumentar a segurança.

## 🔄 GitHub Actions (OIDC + Assume Role)

### ☁️ Configuração na AWS

#### 📍 Caminho:

IAM → Roles → Create Role

#### ⚙️ Definições:

- Trusted entity: GitHub OIDC
- Permissão necessária: sts:AssumeRoleWithWebIdentity

> Essa configuração permite que o GitHub Actions assuma uma role na AWS sem necessidade de credenciais estáticas.

### 🔐 Configuração no GitHub

#### 📍 Caminho:

Repository → Settings → Secrets → Actions

#### ➕ Adicionar secrets:

- COSIGN_PASSWORD
- COSIGN_PRIVATE_KEY
- COSIGN_PUBLIC_KEY
- DOCKER_HUB_ACCESS_TOKEN
- DOCKER_HUB_USERNAME
- FIREBASE_API_KEY
- FIREBASE_APP_ID
- FIREBASE_AUTH_DOMAIN
- FIREBASE_MESSAGING_SENDER_ID
- FIREBASE_PROJECT_ID
- FIREBASE_STORAGE_BUCKET

> Utilize nomes claros e consistentes para facilitar a manutenção do pipeline CI/CD.
> Nunca exponha credenciais diretamente no código-fonte.

## 📦 Deploy no Kubernetes

### 📁 Estrutura

O deploy da aplicação deve ser realizado a partir da pasta: **k8s/**. Localizada na raiz do projeto.

> Utilizar o arquivo **commands.sh** apenas como documentação guia para o deploy.

### 🚀 Serviços implantados

- PostgreSQL
- Prometheus
- Aplicação
- Grafana

### 🔗 Pós-Deploy (Integração)

Após a instalação dos serviços, é necessário obter os endpoints para integração entre os componentes.

#### 🔍 Obter endpoints

Para listar os serviços disponíveis no cluster:

PostgreSQL:
```bash
kubectl get svc --namespace app
```

Prometheus:
```bash
kubectl get svc --namespace monitoring
```

### ⚙️ Atualização de variáveis de ambiente

Com os endpoints em mãos, atualize o arquivo `.env.production`:

POSTGRES_URL_AWS_EKS=<endpoint>  
PROMETHEUS_URL_AWS_EKS=<url>

> Certifique-se de utilizar os endpoints corretos expostos pelos serviços no cluster.
> Em ambientes produtivos, considere o uso de DNS interno (ClusterIP + Service Discovery) ao invés de exposição direta.

## 🔄 Dependências

### 📌 Ordem de inicialização

Para garantir o correto funcionamento do sistema, os serviços devem seguir a seguinte ordem:

1. PostgreSQL
2. Prometheus
3. Aplicação
4. Grafana

### ⚙️ Regras de dependência

- A aplicação depende do PostgreSQL
- O Grafana depende do Prometheus

> Respeitar essa ordem evita falhas de conexão e problemas de inicialização entre os serviços.

---

## ⚙️ Script de Deploy (EKS + Kubernetes)

Este script automatiza o provisionamento e deploy completo da aplicação no cluster EKS, incluindo banco de dados, aplicação e stack de observabilidade.

> ⚠️ **Importante:** Não altere os comandos abaixo. Eles dependem diretamente das variáveis de ambiente e da estrutura do projeto.

---

## ▶️ Execução

> Recomenda-se executar em ambiente controlado e validar cada etapa em caso de falhas.

#### 🔐 Autenticação na AWS e configuração do kubeconfig

Responsável por autenticar na AWS e configurar o acesso ao cluster EKS:

```bash
aws login
aws eks update-kubeconfig --region us-east-1 --name taskpad-cluster
kubectl apply -f cluster/cluster-configs.yaml
```
---

#### 📦 Namespace da aplicação e configurações iniciais

Criação do namespace da aplicação e aplicação de configurações base:

# Namespace app
```bash
kubectl create namespace app
kubectl apply -f namespace/app/config/app-config-map.yaml --namespace app
```
---

#### 🗄️ Configuração e deploy do PostgreSQL

Geração dinâmica de secrets e values via envsubst e instalação via Helm:

```bash
source ../.env.production
export POSTGRES_PORT POSTGRES_DB POSTGRES_USER POSTGRES_PASSWORD POSTGRES_ADMIN_PASSWORD
envsubst < namespace/app/postgres/postgres-secret-template.yaml > namespace/app/postgres/postgres-secret.yaml
envsubst < namespace/app/postgres/postgres-values-template.yaml > namespace/app/postgres/postgres-values.yaml

kubectl apply -f namespace/app/postgres/postgres-secret.yaml --namespace app
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install -f namespace/app/postgres/postgres-values.yaml taskpad-postgres bitnami/postgresql --version 18.5.15 --namespace app
```
---

#### 🔐 Configuração de secrets da aplicação (Firebase, TLS, DB)

Injeção de variáveis sensíveis e criação dos secrets Kubernetes:

```bash
source ../.env.production
export FIREBASE_SERVICE_ACCOUNT POSTGRES_PORT POSTGRES_DB POSTGRES_USER TLS_CRT TLS_KEY POSTGRES_URL_AWS_EKS
export GRAFANA_SECURITY_ADMIN_USER GRAFANA_SECURITY_ADMIN_PASSWORD POSTGRES_PASSWORD POSTGRES_ADMIN_PASSWORD
envsubst < namespace/app/config/app-secrets-template.yaml > namespace/app/config/app-secrets.yaml
envsubst < namespace/app/config/app-tls-secret-template.yaml > namespace/app/config/app-tls-secret.yaml

kubectl apply -f namespace/app/config/app-secrets.yaml --namespace app
kubectl apply -f namespace/app/config/app-tls-secret.yaml --namespace app
kubectl apply -f namespace/app/deployment.yaml --namespace app
```
---

#### 📊 Validação de recursos da aplicação

Verificação do estado dos pods e volumes persistentes:

```bash
kubectl get pods --namespace app
kubectl get pvc --namespace app
```
---

#### 📈 Namespace de monitoramento

Criação do namespace dedicado à observabilidade:

# Namespace monitoring
```bash
kubectl create namespace monitoring
```

---

#### 📊 ConfigMap do Grafana (dashboards)

Geração de ConfigMap com dashboards customizados:

```bash
kubectl create configmap monitoring-config-map \
--from-file=taskpad-dashboard-metrics.json=namespace/monitoring/grafana/TaskPad-Dashboard-Metrics.json \
--namespace monitoring \
--dry-run=client -o yaml > namespace/monitoring/config/monitoring-config-map.yaml
```
---

#### 📡 Deploy do Prometheus

Instalação do Prometheus via Helm:
```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install -f prometheus/prometheus-values.yaml taskpad-prometheus prometheus-community/prometheus --version 29.2.0 --namespace monitoring
```
---

#### 📊 Configuração e deploy do Grafana

Injeção de variáveis e instalação do Grafana com dashboards integrados:

```bash
source ../.env.production
export GRAFANA_SECURITY_ADMIN_USER GRAFANA_SECURITY_ADMIN_PASSWORD PROMETHEUS_URL_AWS_EKS
envsubst < namespace/monitoring/grafana/grafana-secret-template.yaml > namespace/monitoring/grafana/grafana-secret.yaml
envsubst < namespace/monitoring/grafana/grafana-values-template.yaml > namespace/monitoring/grafana/grafana-values.yaml

kubectl apply -f namespace/monitoring/config/monitoring-config-map.yaml --namespace monitoring
helm repo add grafana-community https://grafana-community.github.io/helm-charts/
helm install -f grafana/grafana-values.yaml taskpad-grafana grafana-community/grafana --version 11.6.0 --namespace monitoring
```
---

#### 📊 Validação final

Verificação final dos recursos após deploy completo:
```bash
kubectl get pods --namespace app
kubectl get pvc --namespace app
```
---

### 📌 Observações

- O script depende diretamente do arquivo `.env.production`
- Utiliza `envsubst` para injeção dinâmica de variáveis
- Requer AWS CLI, kubectl e Helm previamente configurados
- Charts Helm versionados garantem previsibilidade de deploy

> Recomenda-se executar em ambiente controlado e validar cada etapa em caso de falhas.

## 🧪 Testes de Carga

Para executar testes de carga utilizando o k6:
```bash
k6 run k6/tests/script.js
```

> Certifique-se de que a aplicação esteja acessível antes de iniciar os testes.
