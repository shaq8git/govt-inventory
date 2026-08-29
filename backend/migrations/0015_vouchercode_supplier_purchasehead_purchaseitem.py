from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0014_alter_product_openqty'),
    ]

    operations = [
        migrations.CreateModel(
            name='VoucherCode',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('shortname', models.CharField(blank=True, max_length=2, null=True)),
                ('description', models.CharField(blank=True, max_length=25, null=True)),
            ],
            options={
                'db_table': 'vouchercode',
                'ordering': ['shortname'],
            },
        ),
        migrations.CreateModel(
            name='Supplier',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('supname', models.CharField(blank=True, max_length=50, null=True)),
                ('contact', models.CharField(blank=True, max_length=50, null=True)),
                ('address', models.CharField(blank=True, max_length=150, null=True)),
                ('shipingadr', models.CharField(blank=True, max_length=200, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'db_table': 'supplier',
                'ordering': ['supname'],
            },
        ),
        migrations.CreateModel(
            name='PurchaseHead',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('invoiceno', models.CharField(max_length=20)),
                ('invoicedate', models.DateField(blank=True, null=True)),
                ('cruser_id', models.IntegerField(default=0)),
                ('upduser_id', models.IntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('supplier', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='purchase_heads', to='backend.supplier')),
                ('vouchercode', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='purchase_heads', to='backend.vouchercode')),
                ('monthlist', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='purchase_heads', to='backend.monthlist')),
                ('yearlist', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='purchase_heads', to='backend.yearlist')),
            ],
            options={
                'db_table': 'purchasehead',
                'ordering': ['-invoicedate', 'invoiceno'],
            },
        ),
        migrations.CreateModel(
            name='PurchaseItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('quantity', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('opnbalance', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('clbalance', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('purrate', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('purprice', models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ('salesrate', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('cruser_id', models.IntegerField(default=0)),
                ('upduser_id', models.IntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('purchasehead', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='items', to='backend.purchasehead')),
                ('product', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='purchase_items', to='backend.product')),
            ],
            options={
                'db_table': 'purchaseitem',
                'ordering': ['product__productname'],
            },
        ),
    ]
