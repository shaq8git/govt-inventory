"""
Seed three suppliers each purchasing এ-৪ পেপার on the same three dates,
so the Daily Purchase Summary page shows aggregated totals across suppliers.
Safe to re-run: uses get_or_create for suppliers and skips heads that
already exist by invoiceno.
"""

from datetime import date as _date
from decimal import Decimal
from unicodedata import normalize as _nfc

from django.core.management.base import BaseCommand

from backend.models import Product, Supplier, PurchaseHead, PurchaseItem

PRODUCT_NAME = "এ-৪ পেপার"

SUPPLIERS = [
    "মেসার্স রহিম স্টেশনারি",
    "মেসার্স করিম এন্টারপ্রাইজ",
    "মেসার্স জামান ট্রেডার্স",
]

# (date, invoiceno_suffix, supplier_index, quantity)
PURCHASES = [
    ("2026-05-10", "A4-10-01", 0, 20),
    ("2026-05-10", "A4-10-02", 1, 15),
    ("2026-05-10", "A4-10-03", 2, 10),
    ("2026-05-15", "A4-15-01", 0, 25),
    ("2026-05-15", "A4-15-02", 1, 30),
    ("2026-05-15", "A4-15-03", 2, 18),
    ("2026-05-20", "A4-20-01", 0, 12),
    ("2026-05-20", "A4-20-02", 1, 22),
    ("2026-05-20", "A4-20-03", 2, 16),
]


def nfc(s):
    return _nfc("NFC", s)


class Command(BaseCommand):
    help = "Seed A4 paper purchases from 3 suppliers for summary page testing"

    def handle(self, *args, **options):
        product_map = {nfc(p.productname): p for p in Product.objects.all()}
        product = product_map.get(nfc(PRODUCT_NAME))
        if product is None:
            self.stdout.write(self.style.ERROR(f"Product not found: {PRODUCT_NAME}"))
            return

        purrate = product.purchaserate or Decimal("420")

        suppliers = []
        for name in SUPPLIERS:
            obj, created = Supplier.objects.get_or_create(supname=name)
            suppliers.append(obj)
            action = "created" if created else "exists"
            self.stdout.write(f"  Supplier {action}: {obj.supname}")

        created_heads = 0
        for date_str, inv_suffix, sup_idx, qty in PURCHASES:
            date = _date.fromisoformat(date_str)
            # Skip if a head already exists for this supplier on this date with this remark
            if PurchaseHead.objects.filter(
                invoicedate=date, supplier=suppliers[sup_idx], remark="A4 paper summary demo"
            ).exists():
                self.stdout.write(f"  Skip (exists): {date_str} {suppliers[sup_idx].supname}")
                continue

            # Let the model auto-generate invoiceno in yyyymmddNNN format
            head = PurchaseHead.objects.create(
                invoicedate=date,
                supplier=suppliers[sup_idx],
                remark="A4 paper summary demo",
            )
            purprice = Decimal(qty) * purrate
            PurchaseItem.objects.create(
                purchasehead=head,
                product=product,
                quantity=qty,
                purrate=purrate,
                purprice=purprice,
                salesrate=product.salesrate or Decimal("0"),
            )
            self.stdout.write(
                f"  Created {head.invoiceno}  {date}  {suppliers[sup_idx].supname}"
                f"  qty={qty}  rate={purrate}  amount={purprice}"
            )
            created_heads += 1

        self.stdout.write(
            self.style.SUCCESS(f"\nDone. {created_heads} purchase heads created.")
        )
