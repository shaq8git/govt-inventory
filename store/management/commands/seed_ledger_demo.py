"""
Seed A4 paper purchase and sales on alternating days in June 2026
to demonstrate the daily ledger view of the Purchase & Sales Report.
Safe to re-run: skips heads that already exist by date+customer/supplier+remark.
"""

from datetime import date
from decimal import Decimal
from unicodedata import normalize as _nfc

from django.core.management.base import BaseCommand

from store.models import Customer, Product, PurchaseHead, PurchaseItem, SalesHead, SalesItem, Supplier

PRODUCT_NAME = "এ-৪ পেপার"

# (date, supplier_name, qty)
PURCHASES = [
    (date(2026, 6, 1),  "মেসার্স রহিম স্টেশনারি",     50),
    (date(2026, 6, 5),  "মেসার্স করিম এন্টারপ্রাইজ", 30),
    (date(2026, 6, 12), "মেসার্স রহিম স্টেশনারি",     40),
    (date(2026, 6, 18), "মেসার্স জামান ট্রেডার্স",     25),
    (date(2026, 6, 25), "মেসার্স করিম এন্টারপ্রাইজ", 60),
]

# (date, customer_name, qty)
SALES = [
    (date(2026, 6, 3),  "ঢাকা জেলা শিক্ষা প্রকৌশল কার্যালয়",      15),
    (date(2026, 6, 8),  "চট্টগ্রাম জেলা শিক্ষা প্রকৌশল কার্যালয়", 20),
    (date(2026, 6, 15), "রাজশাহী জেলা শিক্ষা প্রকৌশল কার্যালয়",   25),
    (date(2026, 6, 20), "সিলেট জেলা শিক্ষা প্রকৌশল কার্যালয়",     10),
    (date(2026, 6, 28), "খুলনা জেলা শিক্ষা প্রকৌশল কার্যালয়",     30),
]


def nfc(s):
    return _nfc("NFC", s)


class Command(BaseCommand):
    help = "Seed A4 paper daily purchase & sales for June 2026 ledger demo"

    def handle(self, *args, **options):
        product_map = {nfc(p.productname): p for p in Product.objects.all()}
        product = product_map.get(nfc(PRODUCT_NAME))
        if product is None:
            self.stdout.write(self.style.ERROR(f"Product not found: {PRODUCT_NAME}"))
            return

        purrate = product.purchaserate or Decimal("380")
        salesrate = product.salesrate or Decimal("420")

        # --- Purchases ---
        self.stdout.write("Creating purchases…")
        for inv_date, sup_name, qty in PURCHASES:
            supplier, _ = Supplier.objects.get_or_create(supname=sup_name)
            remark = "জুন ২০২৬ এ-৪ পেপার"
            if PurchaseHead.objects.filter(invoicedate=inv_date, supplier=supplier, remark=remark).exists():
                self.stdout.write(f"  Skip purchase: {inv_date} {sup_name}")
                continue
            head = PurchaseHead.objects.create(
                invoicedate=inv_date, supplier=supplier, remark=remark
            )
            PurchaseItem.objects.create(
                purchasehead=head, product=product,
                quantity=qty, purrate=purrate, purprice=Decimal(qty) * purrate,
                salesrate=salesrate,
            )
            self.stdout.write(f"  Purchase {head.invoiceno}  {inv_date}  {sup_name}  qty={qty}")

        # --- Sales ---
        self.stdout.write("Creating sales…")
        for inv_date, cust_name, qty in SALES:
            customer, _ = Customer.objects.get_or_create(costname=cust_name)
            remark = "জুন ২০২৬ এ-৪ পেপার"
            if SalesHead.objects.filter(invoicedate=inv_date, customer=customer, remark=remark).exists():
                self.stdout.write(f"  Skip sale: {inv_date} {cust_name}")
                continue
            head = SalesHead.objects.create(
                invoicedate=inv_date, customer=customer, remark=remark
            )
            SalesItem.objects.create(
                saleshead=head, product=product,
                quantity=qty, purrate=purrate, salesrate=salesrate,
                salesprice=Decimal(qty) * salesrate,
            )
            self.stdout.write(f"  Sale    {head.invoiceno}  {inv_date}  {cust_name}  qty={qty}")

        self.stdout.write(self.style.SUCCESS("\nDone."))
