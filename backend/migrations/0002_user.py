from django.db import migrations


def create_user_table_if_missing(apps, schema_editor):
    existing_tables = set(schema_editor.connection.introspection.table_names())
    if "store_user" in existing_tables:
        return

    User = apps.get_model("backend", "User")
    schema_editor.create_model(User)


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_user_table_if_missing, migrations.RunPython.noop),
    ]
