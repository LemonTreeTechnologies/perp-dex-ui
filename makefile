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
	docker compose --profile dev up

docker-prod:
	docker compose --profile prod up

.PHONY: install fmt lint build dev all docker-dev docker-prod
