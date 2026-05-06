from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('store', '0012_product_purchaserate_salesrate'),
    ]

    operations = [
        migrations.AddField(
            model_name='product',
            name='salesdiscountrate',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=6),
        ),
    ]
