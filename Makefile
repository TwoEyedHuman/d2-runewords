.PHONY: dev down build logs clean validate-data lint format deploy fly-logs fly-status

dev:
	docker compose up -d --build

down:
	docker compose down

build:
	docker compose build

logs:
	docker compose logs -f

clean:
	docker compose down
	rm -rf frontend/node_modules frontend/dist

validate-data:
	node frontend/scripts/validate-runewords.mjs

lint:
	cd frontend && npm run lint

format:
	cd frontend && npm run format

deploy:
	fly deploy

fly-logs:
	fly logs

fly-status:
	fly status
