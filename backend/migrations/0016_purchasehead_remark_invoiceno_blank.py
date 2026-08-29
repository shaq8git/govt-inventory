from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0015_vouchercode_supplier_purchasehead_purchaseitem'),
    ]

    operations = [
        migrations.AddField(
            model_name='purchasehead',
            name='remark',
            field=models.CharField(blank=True, max_length=200, null=True),
        ),
        migrations.AlterField(
            model_name='purchasehead',
            name='invoiceno',
            field=models.CharField(blank=True, max_length=20),
        ),
    ]
