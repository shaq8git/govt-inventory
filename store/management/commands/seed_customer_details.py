"""
Fill in contact, address, shipping address and desk for the demo customers
(district education engineering offices) seeded by seed_sales_demo.
Safe to re-run: only fills fields that are currently empty.
"""

from unicodedata import normalize as _nfc

from django.core.management.base import BaseCommand

from store.models import Customer, Desk

# (customer_name, contact, address, shipingadr, desk_name, desk_location)
DETAILS = [
    (
        "ঢাকা জেলা শিক্ষা প্রকৌশল কার্যালয়",
        "০২-৯৬৬৭৮৪৫, ০১৭১২-৩৪৫৬৭৮",
        "জেলা শিক্ষা প্রকৌশল কার্যালয়, আগারগাঁও, শেরেবাংলা নগর, ঢাকা-১২০৭",
        "মালামাল গুদাম, আগারগাঁও, শেরেবাংলা নগর, ঢাকা-১২০৭",
        "ক্রয় ও সরবরাহ শাখা", "ঢাকা",
    ),
    (
        "চট্টগ্রাম জেলা শিক্ষা প্রকৌশল কার্যালয়",
        "০৩১-৬১৪৫২৭, ০১৮১৯-৪৫৬৭৮৯",
        "জেলা শিক্ষা প্রকৌশল কার্যালয়, ডবলমুরিং, চট্টগ্রাম-৪১০০",
        "মালামাল গুদাম, ডবলমুরিং, চট্টগ্রাম-৪১০০",
        "ক্রয় ও সরবরাহ শাখা", "চট্টগ্রাম",
    ),
    (
        "রাজশাহী জেলা শিক্ষা প্রকৌশল কার্যালয়",
        "০৭২১-৭৭২৪১৫, ০১৭১৬-৮৯০১২৩",
        "জেলা শিক্ষা প্রকৌশল কার্যালয়, বোয়ালিয়া, রাজশাহী-৬১০০",
        "মালামাল গুদাম, বোয়ালিয়া, রাজশাহী-৬১০০",
        "হিসাব ও সংরক্ষণ শাখা", "রাজশাহী",
    ),
    (
        "সিলেট জেলা শিক্ষা প্রকৌশল কার্যালয়",
        "০৮২১-৭১৬৫৩৪, ০১৯১৪-৫৬৭৮৯০",
        "জেলা শিক্ষা প্রকৌশল কার্যালয়, জিন্দাবাজার, সিলেট-৩১০০",
        "মালামাল গুদাম, জিন্দাবাজার, সিলেট-৩১০০",
        "হিসাব ও সংরক্ষণ শাখা", "সিলেট",
    ),
    (
        "খুলনা জেলা শিক্ষা প্রকৌশল কার্যালয়",
        "০৪১-৭২০১৪৮, ০১৬৭১-২৩৪৫৬৭",
        "জেলা শিক্ষা প্রকৌশল কার্যালয়, খুলনা সদর, খুলনা-৯১০০",
        "মালামাল গুদাম, খুলনা সদর, খুলনা-৯১০০",
        "ক্রয় ও সরবরাহ শাখা", "খুলনা",
    ),
]


def nfc(s):
    return _nfc("NFC", s)


class Command(BaseCommand):
    help = "Fill contact/address/shipping/desk details for the demo district customers"

    def handle(self, *args, **options):
        customer_map = {nfc(c.costname): c for c in Customer.objects.all()}
        updated = 0
        skipped = 0
        not_found = 0

        for name, contact, address, shipingadr, desk_name, desk_location in DETAILS:
            customer = customer_map.get(nfc(name))
            if customer is None:
                self.stdout.write(self.style.WARNING(f"  Not found: {name}"))
                not_found += 1
                continue

            if customer.contact or customer.address or customer.shipingadr or customer.desk_id:
                self.stdout.write(f"  Skip (already has details): {name}")
                skipped += 1
                continue

            desk, _ = Desk.objects.get_or_create(deskname=desk_name, location=desk_location)

            customer.desk = desk
            customer.contact = contact
            customer.address = address
            customer.shipingadr = shipingadr
            customer.save(update_fields=["desk", "contact", "address", "shipingadr"])
            self.stdout.write(f"  Updated: {name}")
            updated += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"\nDone. {updated} updated, {skipped} already had details, {not_found} not found."
            )
        )
