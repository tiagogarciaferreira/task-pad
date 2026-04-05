IMAGE_NAME = tiagogferreirainfnet/task-pad
TAG ?= latest
FULL_IMAGE = $(IMAGE_NAME):$(TAG)

# Colors for output
GREEN := \033[0;32m
RED := \033[0;31m
YELLOW := \033[1;33m
BLUE := \033[0;34m
NC := \033[0m # No Color

# ============================================
# PRODUCTION TARGETS
# ============================================

# 🏗️ Build production image
build-prod:
	@echo "$(BLUE)🔨 Building production image...$(NC)"
	-docker build -f docker/Dockerfile --no-cache -t $(FULL_IMAGE) .
	@echo "$(GREEN)✅ Production image built: $(FULL_IMAGE)$(NC)"

# 🏷️ Tag production image
tag-prod:
	@echo "$(BLUE)🏷️ Tagging production image...$(NC)"
	docker tag $(FULL_IMAGE) $(IMAGE_NAME):production
	@echo "$(GREEN)✅ Tagged as: $(IMAGE_NAME):production$(NC)"

# 📤 Push production image to registry
push-prod:
	@echo "$(BLUE)📤 Pushing production image to registry...$(NC)"
	-docker push $(IMAGE_NAME) -a
	@echo "$(GREEN)✅ Production image pushed$(NC)"

# 🚀 Deploy production environment
deploy-prod:
	@echo "$(BLUE)🚀 Deploying production environment...$(NC)"
	-docker compose -f docker/docker-compose.yaml --env-file ./.env.production up -d
	@echo "$(GREEN)✅ Production deployment complete$(NC)"

# ============================================
# DEVELOPMENT TARGETS
# ============================================

# 🏗️ Build development image
build-dev:
	@echo "$(BLUE)🔨 Building development image...$(NC)"
	-docker build -f docker/Dockerfile.development --no-cache -t $(FULL_IMAGE) .
	@echo "$(GREEN)✅ Development image built: $(FULL_IMAGE)$(NC)"

# 🏷️ Tag development image
tag-dev:
	@echo "$(BLUE)🏷️ Tagging development image...$(NC)"
	docker tag $(FULL_IMAGE) $(IMAGE_NAME):development
	@echo "$(GREEN)✅ Tagged as: $(IMAGE_NAME):development$(NC)"

# 📤 Push development image to registry
push-dev:
	@echo "$(BLUE)📤 Pushing development image to registry...$(NC)"
	-docker push $(IMAGE_NAME) -a
	@echo "$(GREEN)✅ Development image pushed$(NC)"

# 🚀 Deploy development environment
deploy-dev:
	@echo "$(BLUE)🚀 Deploying development environment...$(NC)"
	-docker compose -f docker/docker-compose.yaml --env-file ./.env.development up -d
	@echo "$(GREEN)✅ Development deployment complete$(NC)"

# ============================================
# UTILITY TARGETS
# ============================================

# 🧹 Clean containers, images, and build cache
clean:
	@echo "$(YELLOW)🧹 Starting cleanup...$(NC)"
	@echo "$(BLUE)🛑 Stopping containers...$(NC)"
	-docker ps -q --filter ancestor=$(FULL_IMAGE) | xargs -r docker stop
	@echo "$(BLUE)🗑️ Removing containers...$(NC)"
	-docker ps -a -q --filter ancestor=$(FULL_IMAGE) | xargs -r docker rm -f -v
	@echo "$(BLUE)💾 Removing dangling volumes...$(NC)"
	-docker volume prune -f
	@echo "$(BLUE)💥 Removing image...$(NC)"
	-docker rmi -f $(FULL_IMAGE) || true
	@echo "$(BLUE)🧹 Removing dangling images...$(NC)"
	-docker image prune -f
	@echo "$(BLUE)🔧 Cleaning build cache...$(NC)"
	-docker builder prune -f
	@echo "$(GREEN)✅ Cleanup complete$(NC)"

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
	@echo "  🏷️  Tag: $(TAG)"
	@echo "  🔗 Full: $(FULL_IMAGE)"
	@docker images --filter reference=$(IMAGE_NAME) --format "table {{.Repository}}:{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}" 2>/dev/null || echo "  ⚠️ No images found"

# 🔄 Full development pipeline
dev: clean build-dev tag-dev push-dev deploy-dev
	@echo "$(GREEN)🎉 Development pipeline complete!$(NC)"

# 🔄 Full production pipeline
prod: clean build-prod tag-prod push-prod deploy-prod
	@echo "$(GREEN)🎉 Production pipeline complete!$(NC)"

# 🆚 Compare dev and prod images
compare:
	@echo "$(BLUE)🔍 Comparing dev and prod images...$(NC)"
	@echo "$(YELLOW)Development:$(NC)"
	-docker images --filter reference=$(IMAGE_NAME):development --format "table {{.Repository}}:{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}"
	@echo ""
	@echo "$(YELLOW)Production:$(NC)"
	-docker images --filter reference=$(IMAGE_NAME):production --format "table {{.Repository}}:{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}"

# ❓ Show available commands
help:
	@echo "$(BLUE)╔══════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(BLUE)║           TASK-PAD DOCKER COMMANDS                           ║$(NC)"
	@echo "$(BLUE)╚══════════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(GREEN)Production Commands:$(NC)"
	@echo "  make build-prod     🏗️  Build production image"
	@echo "  make tag-prod       🏷️  Tag production image"
	@echo "  make push-prod      📤 Push production image to registry"
	@echo "  make deploy-prod    🚀 Deploy production environment"
	@echo ""
	@echo "$(GREEN)Development Commands:$(NC)"
	@echo "  make build-dev      🏗️  Build development image"
	@echo "  make tag-dev        🏷️  Tag development image"
	@echo "  make push-dev       📤 Push development image to registry"
	@echo "  make deploy-dev     🚀 Deploy development environment"
	@echo ""
	@echo "$(GREEN)Pipeline Commands:$(NC)"
	@echo "  make dev            🔄 Full development pipeline (clean → build → tag → push → deploy)"
	@echo "  make prod           🔄 Full production pipeline (clean → build → tag → push → deploy)"
	@echo ""
	@echo "$(GREEN)Utility Commands:$(NC)"
	@echo "  make clean          🧹 Remove containers, images, and build cache"
	@echo "  make drizzle-migrate🗄️ Generate and apply database migrations"
	@echo "  make info           📊 Show image information"
	@echo "  make compare        🆚 Compare dev vs prod images"
	@echo "  make help           ❓ Show this help message"
	@echo ""

.PHONY: build-prod tag-prod push-prod deploy-prod build-dev tag-dev push-dev deploy-dev clean drizzle-migrate info dev prod compare help
