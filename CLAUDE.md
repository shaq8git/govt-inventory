# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Inventory management system for the **Directorate of Education Engineering, Government of Bangladesh** (শিক্ষা প্রকৌশল অধিদপ্তর). Tracks product purchases, sales, returns, transfers, and damage for stationery and office supplies.

## Commands

### Backend (run from `/home/Sumon/store_backend/`)
```sh
# Start DB (PostgreSQL on port 5433)
sudo service docker start
docker compose up -d db

# Run dev server
.venv/bin/python manage.py runserver

# Migrations
.venv/bin/python manage.py makemigrations
.venv/bin/python manage.py migrate

# System check
.venv/bin/python manage.py check

# Run a management command (seed data example)
.venv/bin/python manage.py seed_purchase_demo
.venv/bin/python manage.py seed_sales_demo
.venv/bin/python manage.py seed_ledger_demo
.venv/bin/python manage.py seed_product_rates

# Django shell
.venv/bin/python manage.py shell
```

### Frontend (run from `/home/Sumon/store_backend/frontend/`)
```sh
npm run dev      # dev server at http://127.0.0.1:5173
npm run build    # production build
```

There are no automated tests in this project.

## Architecture

### Stack
- **Backend**: Django 6.0.4 + Django REST Framework + PostgreSQL (via Docker on port 5433)
- **Frontend**: React 18 + Vite + Tailwind CSS (single-page app)
- **Auth**: DRF Token authentication; token stored in `sessionStorage` as `storeAuthToken`

### Backend layout
```
store/
  models.py        # All models in one file
  serializers.py   # All serializers in one file
  views.py         # All ViewSets + APIViews in one file
  urls.py          # Router + extra paths for APIViews
  management/commands/  # Seed scripts
config/
  settings.py      # DB config, DRF config
  urls.py          # Mounts store.urls under /api/
```

### Frontend layout
```
frontend/src/
  App.jsx                 # Shell: sidebar nav, openMenus state, renderContent() router
  i18n/translations.js    # Language toggle (DEFAULT_LANGUAGE = "BN" for Bengali)
  vite.config.js          # i18n JSX-runtime interceptor plugin
  components/             # One file per page/feature
```

### Navigation / routing pattern
`App.jsx` holds all routing. To add a new page:
1. Import the component at the top of `App.jsx`
2. Add a menu item to the `menuGroups` array (under the correct group, e.g. `"reports"`)
3. Add a `case` in the `renderContent()` switch
4. Add `false` for the group's `openMenus` initial state if it's a new group

### API pattern
All API calls from the frontend include:
```js
{ headers: { "Content-Type": "application/json", Authorization: `Token ${sessionStorage.getItem("storeAuthToken")}` } }
```
The Vite dev server proxies `/api/` → `http://localhost:8000/api/`.

Most ViewSets use `permission_classes = [AllowAny]` and `pagination_class = None`.

### Two serializer patterns
**ViewSets** switch serializer by action:
```python
def get_serializer_class(self):
    if self.action == "list":
        return SomeReportSerializer   # read-only, annotated fields
    return SomeCreateSerializer        # write fields only
```

**Aggregation endpoints** (purchase-summary, sales-summary, purchase-sales-report) use `APIView` subclasses registered directly in `urls.py`:
```python
urlpatterns = router.urls + [
    path("purchase-summary/", PurchaseSummaryView.as_view(), name="purchase-summary"),
    ...
]
```

### Date-range filter pattern
ViewSets use dict-format `filterset_fields` for range filtering:
```python
filterset_fields = {
    "purchasehead__invoicedate": ["exact", "gte", "lte"],
}
# Frontend sends: ?purchasehead__invoicedate__gte=2026-01-01&purchasehead__invoicedate__lte=2026-12-31
```

### Auto invoice number
`PurchaseHead` and `SalesHead` auto-generate `invoiceno` in `save()` using `yyyymmddNNN` format (e.g. `20260601001`). Never pass `invoiceno` explicitly in seed commands — omit it and let `save()` handle it. Pass `invoicedate` as a `date` object, not a string.

### Product stock tracking
`Product.currentqty` is maintained live by every model's `save()` method (purchases add, sales subtract). `Product.openqty` is the initial stock set at system setup.

Opening balance calculation used in the Purchase & Sales Report:
```
opening = openqty + sum(purchases before date_from) - sum(sales before date_from)
closing = opening + purchases_in_range - sales_in_range
```

### Bengali Unicode normalization — critical
Bengali product/group names in the DB may be stored in NFC Unicode form. Python source literals may use a different normalization. **Always NFC-normalize** both the key and lookup value when using Bengali strings as dict keys:
```python
from unicodedata import normalize as _nfc
def nfc(s): return _nfc("NFC", s)
product_map = {nfc(p.productname): p for p in Product.objects.all()}
product = product_map.get(nfc("এ-৪ পেপার"))
```
Skipping this causes silent `None` lookups and `UniqueViolation` errors in seed commands.

### i18n
`DEFAULT_LANGUAGE = "BN"` in `frontend/src/i18n/translations.js` activates Bengali for the entire UI via a Vite plugin that wraps the JSX runtime. Switching to `"EN"` reverts to English globally without touching any component files. New user-visible strings must be added to the translation map in `translations.js`.

### Print / PDF
Reports open a new browser window, write a self-contained HTML string with `<style>` and `@page` CSS, then call `window.print()`. No PDF library is used. Portrait reports use `A4 portrait`, landscape use `A4 landscape`.

### Seed commands
All seed scripts live in `store/management/commands/`. They are idempotent — they check for existing records before creating. Run order for a fresh DB:
```sh
seed_admin → seed_status → seed_unit → seed_yearlist → seed_monthlist
→ seed_circleoffice_designation → seed_districtoffice → seed_office
→ (import products from workbook or create manually)
→ seed_product_rates → seed_purchase_demo → seed_a4_summary_demo
→ seed_sales_demo → seed_ledger_demo
```
