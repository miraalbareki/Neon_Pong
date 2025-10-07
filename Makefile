help:
	@awk 'BEGIN {FS = ":.?## "} /^[a-zA-Z_-]+:.?## / {printf "%-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

setup: ## Install all dependencies (npm install for both frontend and backend)
	@echo " Installing backend dependencies..."
	cd Back-end && npm install
	@echo " Installing frontend dependencies..."
	cd Front-end && npm install
	@echo " All dependencies installed!"

certs: ## Generate SSL certificates for HTTPS
	@echo "Generating SSL certificates..."
	@mkdir -p certs
	@openssl req -x509 -nodes -days 365 \
		-newkey rsa:2048 \
		-keyout certs/localhost.key \
		-out certs/localhost.crt \
		-subj "/CN=localhost"

dev: ## Start development servers (backend + frontend)
	@echo "Backend: http://localhost:5001 | Frontend: http://localhost:5173"
	@trap 'kill %1 %2' INT; cd Back-end && npm start & cd Front-end && npm run dev & wait

build: certs ## Build everything (certs + Docker images with dependencies)
	@echo " Building Docker images (includes npm install + build)..."
	docker-compose build --no-cache
	@echo " Build complete! Ready to start with 'make start'"

start: ## Start Docker containers
	docker-compose up -d

stop: ## Stop Docker containers
	docker-compose down

restart: stop start ## Restart Docker containers

restore-db: ## Restore database from database.db file
	@echo "📥 Restoring database from database.db file..."
	@if [ -f "./database.db" ]; then \
		docker-compose up -d; \
		sleep 5; \
		docker cp ./database.db $$(docker-compose ps -q backend):/app/database.db; \
		docker-compose exec -u root backend chown nodejs:nogroup /app/database.db; \
		docker-compose exec -u root backend chmod 664 /app/database.db; \
		echo "✅ Database restored! You can now login."; \
	else \
		echo "❌ database.db file not found! Please get the database file first."; \
	fi

re: ## Restart containers while preserving database
	@docker-compose up -d
	@if docker-compose ps -q backend > /dev/null 2>&1 && [ -n "$$(docker-compose ps -q backend)" ]; then \
		docker cp $$(docker-compose ps -q backend):/app/database.db ./Back-end/queries/database.db 2>/dev/null || echo "⚠️  No existing database to backup"; \
	else \
		echo "⚠️  Backend not running, skipping backup"; \
	fi
	@docker-compose down
	@docker-compose up -d
	@if [ -f "./Back-end/queries/database.db" ]; then \
		docker cp ./Back-end/queries/database.db $$(docker-compose ps -q backend):/app/database.db; \
		docker-compose exec -u root backend chown nodejs:nogroup /app/database.db; \
		docker-compose exec -u root backend chmod 664 /app/database.db; \
		docker-compose restart backend; \
	fi

##switch database path
logs: ## Show Docker container logs
	docker-compose logs -f

clean: ## Clean up Docker containers and images
	docker-compose down --rmi all -v
	docker system prune -f

deploy: build start re## One-command deploy (build + star)
	@echo "NeonPong deployed! Frontend: https://localhost | Backend: http://localhost:5001"

all: build start  ## Complete setup from scratch (Docker handles dependencies)
	@echo "NeonPong Ready! Frontend: https://localhost | Backend: http://localhost:5001"

.PHONY: help build start stop restart restore-db re logs clean dev setup certs deploy all