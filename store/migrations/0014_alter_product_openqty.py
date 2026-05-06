from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('store', '0013_product_salesdiscountrate'),
    ]

    operations = [
        migrations.AlterField(
            model_name='product',
            name='openqty',
            field=models.IntegerField(default=0),
        ),
    ]
