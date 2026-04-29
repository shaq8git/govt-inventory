# Store Backend

Django REST backend for store item issuance records, backed by PostgreSQL.

## Setup

```sh
python -m pip install -r requirements.txt
cp .env.example .env
docker compose up -d db
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

API routes are available under `/api/`:

- `/api/categories/`
- `/api/items/`
- `/api/departments/`
- `/api/issuance-records/`
- `/api/issuance-records/summary/?fiscal_year=2025-26`

## Import the workbook

```sh
python manage.py import_store_workbook "store/images/final store calculation-24-25 (correction).xlsx"
```

Use `--dry-run` to parse the workbook without saving rows.
