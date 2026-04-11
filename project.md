# Projeto: Deploy de Aplicação Containerizada no Kubernetes com Monitoramento e CI/CD

### Disciplina: Integração Contínua, DevOps e Computação em Nuvem

## Objetivo
Criar uma solução completa de containerização, orquestração, monitoramento e integração contínua utilizando Docker, Kubernetes, Prometheus, Grafana e Jenkins.

## Etapas do Projeto

### 1. Docker
- Utilizar o Docker para criar uma imagem personalizada de uma aplicação previamente desenvolvida.
- Publicar a imagem no Docker Hub.

### 2. Kubernetes - Deployment e Exposição
- Subir a aplicação em um cluster Kubernetes utilizando **Deployment** com as seguintes configurações:
  - **4 réplicas**
  - Exposição da aplicação fora do cluster via **NodePort**

### 3. Banco de Dados ou Cache
- **Se a aplicação usar banco de dados:**
  - Criar um Pod com o banco de dados
  - Expor via **ClusterIP**
- **Se NÃO usar banco de dados:**
  - Subir uma imagem do **Redis**
  - Criar um **ClusterIP** para o Redis

### 4. Health Checks
- Implementar **probe** para a aplicação:
  - `ReadinessProbe` ou `LivenessProbe`

### 5. Monitoramento
- Estrutura completa de monitoramento com:
  - **Prometheus** (servidor de métricas)
  - **Grafana** (dashboard)
- **Regras de acesso:**
  - Apenas o Grafana deverá ser exposto fora do cluster
- **Persistência:**
  - Utilizar **PVC (PersistentVolumeClaim)** para armazenar dados do Prometheus de maneira persistente
- **Dashboards:**
  - Criar dashboards no Grafana que exibam dados sensíveis da aplicação (uso de memória, CPU, etc.)

### 6. CI/CD - Pipeline de Entrega
- Utilizar **Jenkins** (ou ferramenta similar) para criar um pipeline de entrega do projeto.

### 7. Teste de Carga e Monitoramento
- Executar um **stress test** na aplicação.
- Capturar **print do dashboard** do Grafana mostrando as alterações durante o teste de estresse.
