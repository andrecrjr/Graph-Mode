FRONT_END_DIR = front-end-graph
BACK_END_DIR = graph-server
IMAGE_PREFIX = graph-mode

COMPOSE = docker-compose -f docker-compose.dev.yaml

setup: install-bun install-all-deps run-dev

install-all-deps: install_deps install_deps_server

# Comando para subir os serviços em modo de desenvolvimento
run-dev:
	@$(COMPOSE) up

# Comando para derrubar os serviços
down:
	@$(COMPOSE) down

# Comando para reconstruir os serviços
build:
	# Derrubando os containers existentes
	$(COMPOSE) down
	
	# Removendo imagens Docker que começam com 'graph-mode', se existirem
	@if docker images | grep '^$(IMAGE_PREFIX)' > /dev/null; then \
	    echo "Removendo imagens com prefixo '$(IMAGE_PREFIX)'..."; \
	    docker images | grep '^$(IMAGE_PREFIX)' | awk '{print $$3}' | xargs docker rmi; \
	else \
	    echo "Nenhuma imagem com prefixo '$(IMAGE_PREFIX)' encontrada."; \
	fi
	
	# Fazendo o build dos serviços com docker-compose
	$(COMPOSE) build

# Comando para ver logs
logs:
	@$(COMPOSE) logs

# Verifica se o Bun está instalado, se não estiver, instala
install-bun:
	@if ! command -v bun > /dev/null; then \
		echo "Bun não encontrado. Instalando Bun..."; \
		curl -fsSL https://bun.sh/install | bash; \
		echo "Adicionando Bun ao PATH..."; \
		export PATH="\$$HOME/.bun/bin:\$$PATH"; \
	else \
		echo "Bun já está instalado."; \
	fi

.PHONY: all run_dev down build logs install-bun install_deps install_deps_server

install_deps: install-bun
	@echo "Instalando dependências na pasta $(FRONT_END_DIR)..."
	cd $(FRONT_END_DIR) && bun install

install_deps_server: install-bun
	@echo "Instalando dependências na pasta $(BACK_END_DIR)..."
	cd $(BACK_END_DIR) && bun install