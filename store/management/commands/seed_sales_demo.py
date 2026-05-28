"""
Seed sales demo data: 5 customers, ~20 sales invoices across Mar–May 2026.
Safe to re-run: skips customers/invoices that already exist.
"""

from datetime import date
from decimal import Decimal
from unicodedata import normalize as _nfc

from django.core.management.base import BaseCommand

from store.models import Customer, Product, SalesHead, SalesItem

CUSTOMERS = [
    "ঢাকা জেলা শিক্ষা প্রকৌশল কার্যালয়",
    "চট্টগ্রাম জেলা শিক্ষা প্রকৌশল কার্যালয়",
    "রাজশাহী জেলা শিক্ষা প্রকৌশল কার্যালয়",
    "সিলেট জেলা শিক্ষা প্রকৌশল কার্যালয়",
    "খুলনা জেলা শিক্ষা প্রকৌশল কার্যালয়",
]

# (date, customer_idx, remark, [(product_name, qty)])
SALES = [
    # March
    ("2026-03-05", 0, "মার্চ অফিস সামগ্রী", [
        ("এ-৪ পেপার", 10),
        ("বল পেন", 50),
        ("স্ট্যাপলার মেশিন (২৪/৬)", 3),
    ]),
    ("2026-03-08", 1, "মার্চ টোনার সরবরাহ", [
        ("প্রিণ্টার টোনার ২২৬-এ", 2),
        ("ফটোকপিয়ার টোনার T-2309C", 1),
    ]),
    ("2026-03-12", 2, "মার্চ স্টেশনারি", [
        ("ফাইল কভার", 30),
        ("জেমস ক্লিপ বক্স", 10),
        ("স্ট্যাপলার পিন বক্স", 5),
        ("চিঠি খাম", 100),
    ]),
    ("2026-03-15", 3, "মার্চ পেপার ও টিস্যু", [
        ("এ-৪ পেপার", 20),
        ("ফেসিয়াল টিস্যু বক্স", 12),
        ("টয়লেট টিস্যু রোল", 24),
    ]),
    ("2026-03-20", 4, "মার্চ আনুষাঙ্গিক", [
        ("পেনড্রাইভ", 5),
        ("মাউস", 3),
        ("মাল্টিপ্লাগ", 4),
    ]),
    ("2026-03-25", 0, "মার্চ টয়লেট সামগ্রী", [
        ("হ্যান্ড ওয়াশ", 6),
        ("হারপিক", 4),
        ("এয়ার ফ্রেশনার", 3),
    ]),
    # April
    ("2026-04-03", 1, "এপ্রিল অফিস সামগ্রী", [
        ("এ-৪ পেপার", 15),
        ("সাইন পেন", 20),
        ("গার্ড ফাইল", 5),
    ]),
    ("2026-04-07", 2, "এপ্রিল টোনার", [
        ("প্রিণ্টার টোনার ৫০৫-এ", 2),
        ("প্রিণ্টার টোনার ৩২৬-এ", 1),
    ]),
    ("2026-04-10", 3, "এপ্রিল স্টেশনারি", [
        ("রেজিস্টার খাতা", 8),
        ("ফাইল বোড", 15),
        ("প্লাস্টি ফাইল এ-৪ সাইজ", 20),
    ]),
    ("2026-04-14", 4, "এপ্রিল পেপার", [
        ("এ-৪ পেপার", 25),
        ("লিগ্যাল পেপার", 10),
    ]),
    ("2026-04-18", 0, "এপ্রিল কালার টোনার", [
        ("প্রিণ্টার টোনার ৭৬১২-এ", 1),
        ("ফটোকপিয়ার টোনার NPG-67", 1),
    ]),
    ("2026-04-22", 1, "এপ্রিল পরিষ্কার সামগ্রী", [
        ("ভীম লিকুইড", 6),
        ("জেট পাউডার", 5),
        ("ডাস্টবিন", 2),
        ("পলিব্যাগ", 10),
    ]),
    ("2026-04-25", 2, "এপ্রিল আনুষাঙ্গিক", [
        ("কীবোড", 2),
        ("মাইস প্যাড", 5),
    ]),
    # May
    ("2026-05-05", 3, "মে অফিস সামগ্রী", [
        ("এ-৪ পেপার", 30),
        ("বল পেন", 60),
        ("জেল পেন", 20),
        ("সিজার", 3),
    ]),
    ("2026-05-08", 4, "মে টোনার সরবরাহ", [
        ("প্রিণ্টার টোনার ২২৬-এ", 3),
        ("ফটোকপিয়ার টোনার T-2309P", 2),
    ]),
    ("2026-05-12", 0, "মে স্টেশনারি", [
        ("ফাইল কভার", 50),
        ("চিঠি খাম", 200),
        ("বান্ডিং ক্লিপ", 20),
    ]),
    ("2026-05-15", 1, "মে পেপার ও টিস্যু", [
        ("এ-৪ পেপার", 20),
        ("এ-৩ পেপার", 5),
        ("ফেসিয়াল টিস্যু বক্স", 10),
    ]),
    ("2026-05-18", 2, "মে আনুষাঙ্গিক", [
        ("পেনড্রাইভ", 8),
        ("মাউস", 4),
        ("ব্যাটারি (AA,AAA)", 20),
    ]),
    ("2026-05-20", 3, "মে টয়লেট সামগ্রী", [
        ("হ্যান্ড ওয়াশ", 8),
        ("টয়লেট টিস্যু রোল", 36),
        ("এয়ার ফ্রেশনার", 4),
        ("লাইজল", 3),
    ]),
    ("2026-05-22", 4, "মে মুদ্রণ সামগ্রী", [
        ("লাইসেন্স বই", 10),
        ("লাইসেন্স ফরম", 20),
    ]),
]


def nfc(s):
    return _nfc("NFC", s)


class Command(BaseCommand):
    help = "Seed sales demo data with 5 customers and ~20 invoices"

    def handle(self, *args, **options):
        # Build product map (NFC-normalized)
        product_map = {nfc(p.productname): p for p in Product.objects.select_related("productgroup").all()}

        # Create / fetch customers
        customers = []
        for name in CUSTOMERS:
            obj, created = Customer.objects.get_or_create(costname=name)
            customers.append(obj)
            self.stdout.write(f"  Customer {'created' if created else 'exists'}: {name}")

        created_heads = 0
        skipped = 0
        missing_products = set()

        for date_str, cust_idx, remark, items_spec in SALES:
            inv_date = date.fromisoformat(date_str)
            customer = customers[cust_idx]

            # Idempotency: skip if a head already exists for same date + customer + remark
            if SalesHead.objects.filter(invoicedate=inv_date, customer=customer, remark=remark).exists():
                skipped += 1
                continue

            # Resolve products first; skip invoice if any product is missing
            resolved = []
            ok = True
            for pname, qty in items_spec:
                prod = product_map.get(nfc(pname))
                if prod is None:
                    missing_products.add(pname)
                    ok = False
                    break
                resolved.append((prod, qty))

            if not ok:
                continue

            # Create head (invoiceno auto-generated in yyyymmddNNN format)
            head = SalesHead.objects.create(
                customer=customer,
                invoicedate=inv_date,
                remark=remark,
            )

            total = Decimal("0")
            for prod, qty in resolved:
                salesrate = prod.salesrate or Decimal("0")
                salesprice = Decimal(qty) * salesrate
                total += salesprice
                SalesItem.objects.create(
                    saleshead=head,
                    product=prod,
                    quantity=qty,
                    purrate=prod.purchaserate or Decimal("0"),
                    salesrate=salesrate,
                    salesprice=salesprice,
                )

            self.stdout.write(
                f"  {head.invoiceno}  {date_str}  {customer.costname[:25]}  "
                f"{len(resolved)} items  ৳{total:,.2f}"
            )
            created_heads += 1

        if missing_products:
            for p in missing_products:
                self.stdout.write(self.style.WARNING(f"  Product not found: {p}"))

        self.stdout.write(
            self.style.SUCCESS(
                f"\nDone. {created_heads} invoices created, {skipped} skipped (already exist)."
            )
        )
