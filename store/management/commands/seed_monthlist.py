from django.core.management.base import BaseCommand
from store.models import MonthList

MONTHS = [
    (1, "Jan"),
    (2, "Feb"),
    (3, "Mar"),
    (4, "Apr"),
    (5, "May"),
    (6, "Jun"),
    (7, "Jul"),
    (8, "Aug"),
    (9, "Sep"),
    (10, "Oct"),
    (11, "Nov"),
    (12, "Dec"),
]


class Command(BaseCommand):
    help = "Seed monthlist table"

    def handle(self, *args, **options):
        created = updated = 0
        for no, name in MONTHS:
            _, made = MonthList.objects.update_or_create(
                monthno=no,
                defaults={"monthname": name},
            )
            if made:
                created += 1
            else:
                updated += 1
        self.stdout.write(self.style.SUCCESS(
            f"MonthList: {created} created, {updated} updated"
        ))
