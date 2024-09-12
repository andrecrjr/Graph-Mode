FRONT_END_DIR=front-end-graph
BACK_END_DIR=graph-server

COMPOSE=docker-compose -f docker-compose.dev.yaml

# -j3 (--jobs) to run parallels in makefile - amazing!
run-all: install-all-deps run-dev -j3

install-all-deps: install_deps install_deps_server

# Comando para subir os serviços em modo de desenvolvimento
run-dev:
	@$(COMPOSE) up

# Comando para derrubar os serviços
down:
	@$(COMPOSE) down

# Comando para reconstruir os serviços
build:
	@$(COMPOSE) build

# Comando para ver logs
logs:
	@$(COMPOSE) logs

.PHONY: all run_dev down build logs

install_deps:
	@echo "Instalando dependências na pasta $(FRONT_END_DIR)..."
	cd $(FRONT_END_DIR) && pnpm install

install_deps_server:
	@echo "Instalando dependências na pasta $(FRONT_END_DIR)..."
	cd $(BACK_END_DIR) && pnpm install