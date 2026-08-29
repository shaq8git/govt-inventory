from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

User = get_user_model()

USERNAME = "admin"
PASSWORD = "admin123"
EMAIL = "admin@example.com"


class Command(BaseCommand):
    help = "Create or reset the default admin superuser (username: admin, password: admin123)"

    def handle(self, *args, **options):
        user, created = User.objects.get_or_create(
            username=USERNAME,
            defaults={"email": EMAIL, "is_superuser": True, "is_staff": True},
        )
        user.set_password(PASSWORD)
        user.is_active = True
        user.is_superuser = True
        user.is_staff = True
        user.save()

        if created:
            self.stdout.write(self.style.SUCCESS(f'Superuser "{USERNAME}" created with password "{PASSWORD}".'))
        else:
            self.stdout.write(self.style.SUCCESS(f'Superuser "{USERNAME}" password reset to "{PASSWORD}".'))
