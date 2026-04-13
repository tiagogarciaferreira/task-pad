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

## ✅ Requisitos (Build e Imagem)

Para executar o pipeline de build, tag, assinatura e push da imagem Docker, é necessário ter os seguintes componentes configurados:

### 🐳 Docker

- Responsável pelo build, tag e push das imagens
- Utilizado nos comandos:
>  docker build - docker tag - docker push

- Também utilizado pelo `docker compose` no target `up`

---

### 🔐 Cosign

- Utilizado para assinatura e verificação de imagens

Comandos utilizados:
>cosign sign - cosign verify

#### 📁 Requisitos:

- Chaves presentes em:
> .cosign/cosign.key - .cosign/cosign.pub

---

### 🔍 Dive

- Ferramenta para análise de camadas e qualidade da imagem Docker
- Executado via container:

wagoodman/dive

- Utilizado no target `analyze`

---

### 🟢 Node.js

- Utilizado para obtenção da versão da aplicação

Comando utilizado:
> node -p "require('./package.json').version"

---

### 🐳 Docker Hub (ou registry compatível)

- Necessário para publicação das imagens

#### 🔐 Requisitos:

- Autenticação via:
> docker login

- Utilizado no target `push`

---

### 🐧 Make (GNU Make)

- Responsável por orquestrar todo o pipeline

Inclui:

- build
- tag
- assinatura
- análise
- push

---

## ⚠️ Essencial

Sem esses itens corretamente configurados:

- A imagem não será construída (Docker)
- Não será versionada corretamente (Node.js)
- Não será assinada (Cosign)
- Não será analisada (Dive)
- Não será publicada (Docker Hub)
- O pipeline não será executado (Make)

## ✅ Requisitos Deploy

Para executar o deploy no EKS, é necessário ter os seguintes componentes configurados:

### ☁️ AWS CLI

- Responsável pela autenticação e acesso ao cluster EKS
- Utilizado no comando:

aws eks update-kubeconfig

---

### ☸️ kubectl

- Ferramenta para gerenciamento de recursos no Kubernetes
- Utilizada durante todo o processo de deploy:

kubectl apply  
kubectl get

---

### 📦 Helm

- Gerenciador de pacotes para Kubernetes
- Utilizado para instalação dos serviços:

- PostgreSQL
- Prometheus
- Grafana

---

### 🔄 envsubst

- Utilizado para gerar arquivos YAML a partir de templates
- Permite injetar variáveis do arquivo `.env.production`

---

### 🐧 Bash + `.env.production` configurado

- Necessário para execução dos scripts de automação
- O arquivo `.env.production` deve conter todas as variáveis obrigatórias:

- Banco de dados (POSTGRES_*)
- Firebase
- TLS
- Grafana

---

### 🔐 OpenSSL

- Utilizado para geração de certificados TLS
- Executado via script:

certs/generate.sh

---

## ⚠️ Essencial

Sem esses itens corretamente configurados:

- O cluster não será acessado (AWS CLI)
- Os recursos não serão criados (kubectl / Helm)
- Os arquivos não serão gerados corretamente (envsubst)
- A aplicação não será iniciada corretamente (variáveis de ambiente + TLS)

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
  iconv -f UTF-8 -t UTF-8 service-account.json | base64 -w 0
  ```
### Configurar no .env

A string gerada deve ser inserida nos arquivos de configuração de ambiente correspondentes:

**Arquivos:** `.env.development` / `.env.production`

**Variável:**
FIREBASE_SERVICE_ACCOUNT=<BASE64>

## 📁 Configuração de Ambientes Firebase

**Caminho Firebase:**  
Firebase Console → Project Settings → General

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
kubectl get nodes -o jsonpath='{range .items[*]}{.status.addresses[?(@.type=="ExternalIP")].address}{"\n"}{end}'
   ```

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
- Esse token precisa ser inserido na secret **DOCKER_HUB_ACCESS_TOKEN** no GitHub Actions

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
- COSIGN_PASSWORD
- COSIGN_PRIVATE_KEY
- COSIGN_PUBLIC_KEY

## 🔐 Certificados SSL

### ▶️ Geração dos certificados

Execute os comandos abaixo dentro da pasta `certs`:

#### ⚙️ Configuração do openssl.conf

O arquivo `openssl.conf` deve conter os IPs dos nodes do cluster EKS para garantir a validade do certificado.

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
  iconv -f UTF-8 -t UTF-8 key.pem | base64 -w 0
  iconv -f UTF-8 -t UTF-8 cert.pem | base64 -w 0
  ```

### ⚙️ Configuração nos arquivos `.env`

Adicione os valores convertidos no seguinte arquivo:

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
- Porta: (NodePort do serviço)(Aplicação na porta: **30080** e Grafana na porta **32000**)
- Source: 0.0.0.0/0 *(ou restringir conforme necessário)*

> Recomenda-se restringir o acesso por IP para aumentar a segurança.
- Verificar IP: http://checkip.amazonaws.com

## 🔄 GitHub Actions (OIDC + Assume Role)

- [AWS Doc](https://aws.amazon.com/pt/blogs/aws-brasil/como-utilizar-iam-roles-para-conectar-o-github-actions-na-aws/)

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

> Nunca exponha credenciais diretamente no código-fonte.

## 📦 Deploy no Kubernetes

### 📁 Estrutura

O deploy da aplicação deve ser realizado a partir da pasta: **k8s/**. Localizada na raiz do projeto.

> Utilizar o arquivo **k8s/commands.sh** apenas como documentação guia para o deploy.

### 🚀 Serviços implantados

- PostgreSQL
- Aplicação
- Prometheus
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

## ▶️ Execução

> Recomenda-se executar em ambiente controlado e validar cada etapa em caso de falhas.
[Comandos](https://github.com/tiagogarciaferreira/task-pad/blob/main/k8s/commands.sh)

## 🧪 Testes de Carga

Para executar testes de carga utilizando o k6:

- Primeiro, deve ser criado na pasta /k6/ o arquivo hosts.txt, contendo os hosts que serão testados.
- Atualmente, os testes são simples e consistem apenas no acesso à página de login, devido à complexidade de automatizar a autenticação via Google OAuth(Firebase).
- Em seguida,

```bash
k6 run --insecure-skip-tls-verify k6/tests/login-page.js
```

> Certifique-se de que a aplicação esteja acessível antes de iniciar os testes.
