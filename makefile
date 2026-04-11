install:
	yarn install
fmt:
	yarn run format
lint: 
	yarn run lint
build:
	yarn build
dev: 
	yarn dev

all: fmt lint build

# Docker commands
docker-dev:
	docker-compose --profile dev up

docker-dev-build:
	docker-compose --profile dev up --build

docker-dev-down:
	docker-compose --profile dev down

docker-prod:
	docker-compose --profile prod up

docker-prod-build:
	docker-compose --profile prod up --build

docker-prod-down:
	docker-compose --profile prod down

docker-logs-dev:
	docker-compose logs -f perp-dex-ui-dev

docker-logs-prod:
	docker-compose logs -f perp-dex-ui-prod

docker-clean:
	docker-compose down -v
	docker system prune -f

.PHONY: install fmt lint build dev all docker-dev docker-dev-build docker-dev-down docker-prod docker-prod-build docker-prod-down docker-logs-dev docker-logs-prod docker-clean
