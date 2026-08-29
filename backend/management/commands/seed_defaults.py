"""
Idempotent seed for default roles and test users.
Safe to run on every startup — skips anything that already exists.
"""
from django.core.management.base import BaseCommand
from backend.models import UserRole, User

DEFAULT_ROLES = ["System Admin", "Normal User", "Store Admin"]

TEST_USERS = [
    {"username": "testuser",   "password": "test1234",  "email": "testuser@local.dev",   "role": "Normal User"},
    {"username": "storeadmin", "password": "store1234", "email": "storeadmin@local.dev", "role": "Store Admin"},
]


class Command(BaseCommand):
    help = "Seed default roles and test users (idempotent)"

    def handle(self, *args, **options):
        # Roles
        for name in DEFAULT_ROLES:
            _, created = UserRole.objects.get_or_create(rolename=name)
            if created:
                self.stdout.write(f"  Created role: {name}")
            else:
                self.stdout.write(f"  Role exists:  {name}")

        # Test users
        for spec in TEST_USERS:
            role = UserRole.objects.filter(rolename=spec["role"]).first()
            if User.objects.filter(username=spec["username"]).exists():
                self.stdout.write(f"  User exists:  {spec['username']}")
                continue
            u = User(username=spec["username"], email=spec["email"])
            u.set_password(spec["password"])
            u.userrole = role
            u.save()
            self.stdout.write(f"  Created user: {spec['username']} / {spec['password']}  [{spec['role']}]")

        self.stdout.write(self.style.SUCCESS("\nSeed complete."))
