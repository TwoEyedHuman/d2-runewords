.PHONY: dev down build logs clean validate-data lint format

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
