from django.core.management.base import BaseCommand
from store.models import Unit

UNITS = [
    "Box",
    "Kg",
    "Litre",
    "Other",
    "Packet",
    "Piece",
    "Ream",
    "Roll",
    "Set",
]


class Command(BaseCommand):
    help = "Seed unit table"

    def handle(self, *args, **options):
        created = updated = 0
        for name in UNITS:
            _, made = Unit.objects.get_or_create(unitname=name)
            if made:
                created += 1
            else:
                updated += 1
        self.stdout.write(self.style.SUCCESS(
            f"Unit: {created} created, {updated} already existed"
        ))
