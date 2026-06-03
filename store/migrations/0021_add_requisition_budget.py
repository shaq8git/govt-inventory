import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('store', '0020_add_damagehead_damageitem'),
    ]

    operations = [
        migrations.CreateModel(
            name='RequisitionHead',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('requisitionno', models.CharField(blank=True, max_length=20)),
                ('requisitiondate', models.DateField(blank=True, null=True)),
                ('remark', models.CharField(blank=True, max_length=200, null=True)),
                ('cruser_id', models.IntegerField(default=0)),
                ('upduser_id', models.IntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('customer', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='requisition_heads', to='store.customer')),
                ('monthlist', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='requisition_heads', to='store.monthlist')),
                ('vouchercode', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='requisition_heads', to='store.vouchercode')),
                ('yearlist', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='requisition_heads', to='store.yearlist')),
            ],
            options={
                'db_table': 'requisitionhead',
                'ordering': ['-requisitiondate', 'requisitionno'],
            },
        ),
        migrations.CreateModel(
            name='RequisitionItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('primquantity', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('reqquantity', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('requserinfo_id', models.IntegerField(default=0)),
                ('approveuserinfo_id', models.IntegerField(default=0)),
                ('approvflag', models.SmallIntegerField(default=0)),
                ('approvdate', models.DateField(blank=True, null=True)),
                ('cruser_id', models.IntegerField(default=0)),
                ('upduser_id', models.IntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('requisitionhead', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='items', to='store.requisitionhead')),
                ('product', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='requisition_items', to='store.product')),
            ],
            options={
                'db_table': 'requisitionitem',
                'ordering': ['product__productname'],
            },
        ),
        migrations.CreateModel(
            name='BudgetHead',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('budgetno', models.CharField(blank=True, max_length=20)),
                ('budgetdate', models.DateField(blank=True, null=True)),
                ('remark', models.CharField(blank=True, max_length=200, null=True)),
                ('cruser_id', models.IntegerField(default=0)),
                ('upduser_id', models.IntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('customer', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='budget_heads', to='store.customer')),
                ('monthlist', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='budget_heads', to='store.monthlist')),
                ('vouchercode', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='budget_heads', to='store.vouchercode')),
                ('yearlist', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='budget_heads', to='store.yearlist')),
            ],
            options={
                'db_table': 'budgethead',
                'ordering': ['-budgetdate', 'budgetno'],
            },
        ),
        migrations.CreateModel(
            name='BudgetItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('primquantity', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('primpurrate', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('bdgquantity', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('bdgpurrate', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('bdguserinfo_id', models.IntegerField(default=0)),
                ('approveuserinfo_id', models.IntegerField(default=0)),
                ('approvflag', models.SmallIntegerField(default=0)),
                ('approvdate', models.DateField(blank=True, null=True)),
                ('cruser_id', models.IntegerField(default=0)),
                ('upduser_id', models.IntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('budgethead', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='items', to='store.budgethead')),
                ('product', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='budget_items', to='store.product')),
            ],
            options={
                'db_table': 'budgetitem',
                'ordering': ['product__productname'],
            },
        ),
    ]
