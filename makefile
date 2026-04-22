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
	docker compose --profile dev up --build

docker-prod:
	docker compose --profile prod up -d --build

.PHONY: install docs fmt lint build dev all docker-dev docker-prod

docs:
	npx @marp-team/marp-cli@latest docs/PRESENTATION.md --html --allow-local-files -o static/presentation.html
