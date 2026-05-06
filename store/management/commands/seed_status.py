from django.core.management.base import BaseCommand
from store.models import Status

STATUSES = [
    (1, "Active"),
    (2, "Inactive"),
]


class Command(BaseCommand):
    help = "Seed status table"

    def handle(self, *args, **options):
        created = updated = 0
        for pk, name in STATUSES:
            _, made = Status.objects.update_or_create(
                id=pk,
                defaults={"statusname": name},
            )
            if made:
                created += 1
            else:
                updated += 1
        self.stdout.write(self.style.SUCCESS(
            f"Status: {created} created, {updated} updated"
        ))
