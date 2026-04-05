IMAGE_NAME = tiagogferreirainfnet/task-pad
TAG ?= latest
VERSION ?=1.1.0
FULL_IMAGE = $(IMAGE_NAME):$(TAG)

# Colors for output
GREEN := \033[0;32m
RED := \033[0;31m
YELLOW := \033[1;33m
BLUE := \033[0;34m
NC := \033[0m # No Color

# ============================================
# IMAGE BUILD & DEPLOY TARGETS
# ============================================

# 🏗️ Build image
build:
	@echo "$(BLUE)🔨 Building production image...$(NC)"
	-docker build -f docker/Dockerfile --no-cache -t $(FULL_IMAGE) .
	@echo "$(GREEN)✅ Production image built: $(FULL_IMAGE)$(NC)"

# 🏷️ Tag image
tag:
	@echo "$(BLUE)🏷️ Tagging production image...$(NC)"
	docker tag $(FULL_IMAGE) $(IMAGE_NAME):$(VERSION)
	@echo "$(GREEN)✅ Tagged as: $(IMAGE_NAME):production$(NC)"

# 📤 Push image to registry
push:
	@echo "$(BLUE)📤 Pushing production image to registry...$(NC)"
	-docker push $(IMAGE_NAME) -a
	@echo "$(GREEN)✅ Production image pushed$(NC)"

# 🚀 Deploy
deploy:
	@echo "$(BLUE)🚀 Deploying environment...$(NC)"
	-docker compose -p "taskpad" -f docker/docker-compose.yaml --env-file ./.env.production up -d
	@echo "$(GREEN)✅ Deployment complete$(NC)"

# ============================================
# UTILITY TARGETS
# ============================================

# 🧹 Clean containers, images, and build cache
clean:
	@echo "$(YELLOW)🧹 Starting cleanup...$(NC)"
	@echo "$(BLUE)🛑 Stopping containers...$(NC)"
	-docker stop grafana prometheus app postgres
	@echo "$(BLUE)🗑️ Removing containers...$(NC)"
	-docker rm -f grafana prometheus app postgres
	@echo "$(BLUE)💾 Removing volumes...$(NC)"
	-docker volume rm postgres_data grafana_data prometheus_data
	@echo "$(BLUE)💥 Removing image...$(NC)"
	 -docker images --format '{{.Repository}}:{{.Tag}}' | grep "^$(IMAGE_NAME):" | xargs -r docker rmi -f
	@echo "$(BLUE)🔧 Cleaning build cache...$(NC)"

# 🗄️ Database migrations with Drizzle
drizzle-migrate:
	@echo "$(BLUE)📋 Generating migrations...$(NC)"
	npx drizzle-kit generate
	@echo "$(BLUE)📤 Applying migrations...$(NC)"
	npx drizzle-kit migrate
	@echo "$(GREEN)✅ Migrations complete$(NC)"

# 📊 Show image info
info:
	@echo "$(BLUE)📊 Image Information:$(NC)"
	@echo "  📦 Name: $(IMAGE_NAME)"
	@echo "  🏷️  Tag: $(TAG) - $(VERSION)"
	@docker images --filter reference=$(IMAGE_NAME) --format "table {{.Repository}}:{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}" 2>/dev/null || echo "  ⚠️ No images found"

# 🔄 Full pipeline
full: clean build tag info push deploy
	@echo "$(GREEN)🎉 Pipeline complete!$(NC)"

# ❓ Show available commands
help:
	@echo "$(BLUE)╔══════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(BLUE)║           TASK-PAD DOCKER COMMANDS                           ║$(NC)"
	@echo "$(BLUE)╚══════════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(GREEN)Production Commands:$(NC)"
	@echo "  make build     🏗️ Build image"
	@echo "  make tag       🏷️ Tag image"
	@echo "  make push      📤 Push image to registry"
	@echo "  make deploy    🚀 Deploy environment"
	@echo ""
	@echo "$(GREEN)Pipeline Commands:$(NC)"
	@echo "  make full            🔄 Full pipeline (clean → build → tag → push → deploy)"
	@echo ""
	@echo "$(GREEN)Utility Commands:$(NC)"
	@echo "  make clean          🧹 Remove containers, images, and build cache"
	@echo "  make drizzle-migrate🗄️ Generate and apply database migrations"
	@echo "  make info           📊 Show image information"
	@echo "  make help           ❓ Show this help message"
	@echo ""

.PHONY: build tag push deploy clean drizzle-migrate info full help
