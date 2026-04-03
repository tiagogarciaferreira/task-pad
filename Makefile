IMAGE_NAME = tiagogferreirainfnet/task-pad
TAG = latest

build:
	-docker build --no-cache -t $(IMAGE_NAME):$(TAG) .

build-dev:
	-docker build -f Dockerfile.development --no-cache -t $(IMAGE_NAME):$(TAG) .

push:
	-docker push $(IMAGE_NAME):$(TAG)

deploy:
	-docker compose up

clean:
	@echo "Stopping containers from image $(FULL_IMAGE)..."
	-docker ps -q --filter ancestor=$(FULL_IMAGE) | xargs -r docker stop

	@echo "Removing containers from image $(FULL_IMAGE)..."
	-docker ps -a -q --filter ancestor=$(FULL_IMAGE) | xargs -r docker rm -f -v

	@echo "Removing dangling volumes (safe cleanup)..."
	-docker volume prune -f

	@echo "Removing image $(FULL_IMAGE)..."
	-docker rmi -f $(FULL_IMAGE) || true

	@echo "Removing dangling images..."
	-docker image prune -f

	@echo "Cleaning build cache related..."
	-docker builder prune -f

drizzle-reset:
	@echo "Cleaning migrations..."
	find drizzle -mindepth 1 -delete

	@echo "Generating migrations..."
	npx drizzle-kit generate

	@echo "Applying migrations..."
	npx drizzle-kit migrate

	@echo "Applying changes..."
	npx drizzle-kit push

	@echo "Pulling info..."
	npx drizzle-kit pull

	@echo "Done!"

