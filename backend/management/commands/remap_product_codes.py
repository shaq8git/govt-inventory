"""
Remap existing product codes to the format {groupcode}{seq:04d}
where seq starts at 1001 for the first product in each group.

Example: group 100 → 1001001, 1001002, 1001003 …
         group 101 → 1011001, 1011002 …

Safe to run on a DB that already has the new format (idempotent):
it will only remap codes that do not already start with the group prefix.

Run once after migrating an existing DB:
    python manage.py remap_product_codes
    python manage.py remap_product_codes --dry-run   # preview without saving
"""

from django.core.management.base import BaseCommand
from django.db import transaction

from backend.models import Product, ProductGroup


class Command(BaseCommand):
    help = "Remap product codes to {groupcode}{seq:04d} format"

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Print planned changes without saving",
        )

    def handle(self, *args, **options):
        dry_run = options["dry_run"]
        if dry_run:
            self.stdout.write(self.style.WARNING("DRY RUN — no changes will be saved.\n"))

        groups = list(ProductGroup.objects.all().order_by("groupcode"))
        if not groups:
            self.stdout.write(self.style.ERROR("No product groups found."))
            return

        # Build the full remapping plan first
        plan = []  # list of (product, new_prodcode)
        for group in groups:
            products = list(group.products.order_by("prodcode"))
            seq = 1001
            for prod in products:
                new_code = int(f"{group.groupcode}{seq:04d}")
                plan.append((prod, new_code))
                seq += 1

        if not plan:
            self.stdout.write("No products found.")
            return

        # Show preview
        for prod, new_code in plan:
            marker = "" if prod.prodcode != new_code else "  (already correct)"
            self.stdout.write(
                f"  {prod.prodcode:>10} → {new_code}  {prod.productname[:40]}{marker}"
            )

        changes = [(p, c) for p, c in plan if p.prodcode != c]
        self.stdout.write(f"\n{len(changes)} of {len(plan)} products need updating.")

        if not changes:
            self.stdout.write(self.style.SUCCESS("All product codes are already in the correct format."))
            return

        if dry_run:
            return

        with transaction.atomic():
            # Pass 1: set all changing products to a temporary negative code
            # (avoids unique-constraint violations during reassignment)
            for prod, _ in changes:
                Product.objects.filter(pk=prod.pk).update(prodcode=-(prod.pk))

            # Pass 2: assign the correct new codes
            for prod, new_code in changes:
                Product.objects.filter(pk=prod.pk).update(prodcode=new_code)
                self.stdout.write(f"  Updated {prod.prodcode} → {new_code}  {prod.productname[:40]}")

        self.stdout.write(
            self.style.SUCCESS(f"\nDone. {len(changes)} product codes updated.")
        )
