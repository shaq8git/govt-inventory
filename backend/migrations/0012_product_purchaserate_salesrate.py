from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0011_status_alter_product'),
    ]

    operations = [
        migrations.AddField(
            model_name='product',
            name='purchaserate',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=12),
        ),
        migrations.AddField(
            model_name='product',
            name='salesrate',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=12),
        ),
    ]
