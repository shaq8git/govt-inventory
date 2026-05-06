from django.core.management.base import BaseCommand
from store.models import UserRole

USERROLES = [
    (1, 'Super Admin(Head Office)'),
    (2, 'Admin (Head Office)'),
    (3, 'System Admin (Head Office)'),
    (4, 'User'),
    (5, 'Circle Office Admin'),
    (6, 'District Office Admin'),
    (7, 'Upazila Engineer Office Admin'),
]


class Command(BaseCommand):
    help = "Seed userrole table from SQL data"

    def handle(self, *args, **options):
        created = updated = 0
        for pk, name in USERROLES:
            _, made = UserRole.objects.update_or_create(
                id=pk,
                defaults={"rolename": name},
            )
            if made:
                created += 1
            else:
                updated += 1
        self.stdout.write(self.style.SUCCESS(
            f"UserRole: {created} created, {updated} updated"
        ))
