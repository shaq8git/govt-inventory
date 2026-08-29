from django.core.management.base import BaseCommand
from backend.models import YearList

START_YEAR = 2025
END_YEAR = 2035


class Command(BaseCommand):
    help = "Seed yearlist table"

    def handle(self, *args, **options):
        created = updated = 0
        for yr in range(START_YEAR, END_YEAR + 1):
            _, made = YearList.objects.get_or_create(yearnumber=yr)
            if made:
                created += 1
            else:
                updated += 1
        self.stdout.write(self.style.SUCCESS(
            f"YearList: {created} created, {updated} already existed"
        ))
