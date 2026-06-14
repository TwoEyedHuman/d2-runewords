.PHONY: dev down build logs clean validate-data

dev:
	docker compose up --build

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
