from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('store', '0007_headoffice'),
    ]

    operations = [
        migrations.CreateModel(
            name='ProductGroup',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('groupcode', models.IntegerField(unique=True)),
                ('groupname', models.CharField(max_length=200)),
                ('slno', models.IntegerField(default=0)),
            ],
            options={
                'db_table': 'productgroup',
                'ordering': ['slno', 'groupname'],
            },
        ),
        migrations.CreateModel(
            name='Mfccompany',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('companyname', models.CharField(max_length=200)),
                ('address', models.CharField(blank=True, max_length=300, null=True)),
                ('contactno', models.CharField(blank=True, max_length=50, null=True)),
                ('status_id', models.SmallIntegerField(default=1)),
            ],
            options={
                'db_table': 'mfccompany',
                'ordering': ['companyname'],
            },
        ),
        migrations.CreateModel(
            name='Product',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('prodcode', models.IntegerField(unique=True)),
                ('productname', models.CharField(max_length=300)),
                ('productgroup', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='products', to='store.productgroup')),
                ('mfccompany', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='products', to='store.mfccompany')),
                ('unit', models.CharField(blank=True, max_length=50, null=True)),
                ('specification', models.CharField(blank=True, max_length=500, null=True)),
                ('slno', models.IntegerField(default=0)),
                ('openqty', models.DecimalField(decimal_places=3, default=0, max_digits=12)),
                ('openqtyyear_id', models.IntegerField(default=0)),
                ('currentqty', models.DecimalField(decimal_places=3, default=0, max_digits=12)),
                ('currentqtyyear_id', models.IntegerField(default=0)),
                ('status_id', models.SmallIntegerField(default=1)),
            ],
            options={
                'db_table': 'product',
                'ordering': ['slno', 'productname'],
            },
        ),
    ]
