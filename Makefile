FRONT_END_DIR = front-end-graph
BACK_END_DIR = graph-server
IMAGE_PREFIX = graph-mode
COMPOSE = docker-compose -f docker-compose.dev.yaml

# Setup and run all services
setup: install-bun install-all-deps run-dev
install-all-deps: install_deps install_deps_server
run-all: run-dev

# Development commands
run-dev:
	@$(COMPOSE) up

down:
	@$(COMPOSE) down

restart: down run-dev

# Build commands
build-front-end:
	cd $(FRONT_END_DIR) && pnpm run clean && pnpm run build

build:
	@$(COMPOSE) down
	@if docker images | grep '^$(IMAGE_PREFIX)' > /dev/null; then \
		echo "Removing images with prefix '$(IMAGE_PREFIX)'..."; \
		docker images | grep '^$(IMAGE_PREFIX)' | awk '{print $3}' | xargs docker rmi -f; \
	else \
		echo "No images with prefix '$(IMAGE_PREFIX)' found."; \
	fi
	@$(COMPOSE) build --no-cache

# Utility commands
logs:
	@$(COMPOSE) logs

logs-follow:
	@$(COMPOSE) logs -f

# Dependency management
install-bun:
	@if ! command -v bun > /dev/null; then \
		echo "Installing Bun..."; \
		curl -fsSL https://bun.sh/install | bash; \
	else \
		echo "Bun already installed."; \
	fi

install_deps: install-bun
	@echo "Installing frontend dependencies..."
	cd $(FRONT_END_DIR) && bun install

install_deps_server:
	@echo "Installing backend dependencies..."
	cd $(BACK_END_DIR) && pnpm install

# Development tools
stripe-dev:
	stripe listen --forward-to http://localhost:3001/webhook/stripe

exec-redis:
	docker exec -it graph-mode-redis-1 sh

exec-app:
	docker exec -it graph-mode-server-1 sh

# Deployment
deploy-chrome-extension:
	cd chrome-extension && zip -r graph-mode-extension.zip dist

.PHONY: setup install-all-deps run-all run-dev down restart build-front-end build logs logs-follow install-bun install_deps install_deps_server stripe-dev exec-redis exec-app deploy-chrome-extension