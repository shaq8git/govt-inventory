from django.db import migrations


USER_ROLES = [
    (1, "Super Admin(Head Office)"),
    (2, "Admin (Head Office)"),
    (3, "System Admin (Head Office)"),
    (4, "User"),
    (5, "Circle Office Admin"),
    (6, "District Office Admin"),
    (7, "Upazila Engineer Office Admin"),
]


def seed_user_roles(apps, schema_editor):
    Group = apps.get_model("auth", "Group")
    for _legacy_id, name in USER_ROLES:
        Group.objects.get_or_create(name=name)


def unseed_user_roles(apps, schema_editor):
    Group = apps.get_model("auth", "Group")
    Group.objects.filter(name__in=[name for _legacy_id, name in USER_ROLES]).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("store", "0002_user"),
    ]

    operations = [
        migrations.RunPython(seed_user_roles, unseed_user_roles),
    ]
