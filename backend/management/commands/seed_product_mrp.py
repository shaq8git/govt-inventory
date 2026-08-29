"""
Seed realistic MRP (maximum retail price) for products, derived from their
sales rate with a retail markup and rounded to a typical price-tag value.
MRP represents the printed/market retail ceiling price, which sits above the
institutional sales rate the office charges other offices.
Safe to re-run: only fills products where mrp is currently 0.
"""

from decimal import Decimal, ROUND_UP

from django.core.management.base import BaseCommand

from backend.models import Product

MARKUP = Decimal("1.15")


def _round_step(value):
    if value < 50:
        return Decimal(5)
    if value < 500:
        return Decimal(10)
    if value < 2000:
        return Decimal(50)
    return Decimal(100)


def realistic_mrp(salesrate):
    step = _round_step(salesrate)
    raw = salesrate * MARKUP
    return (raw / step).to_integral_value(rounding=ROUND_UP) * step


class Command(BaseCommand):
    help = "Seed realistic MRP values for products, derived from their sales rate"

    def handle(self, *args, **options):
        skipped = Product.objects.exclude(mrp=0).count()
        updated = 0
        for product in Product.objects.filter(mrp=0, salesrate__gt=0):
            mrp = realistic_mrp(product.salesrate)
            product.mrp = mrp
            product.save(update_fields=["mrp"])
            self.stdout.write(
                f"  {product.prodcode}  {product.productname}  sales={product.salesrate}  →  mrp={mrp}"
            )
            updated += 1

        self.stdout.write(self.style.SUCCESS(f"\nDone. {updated} updated, {skipped} already had MRP."))
