from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('store', '0008_productgroup_mfccompany_product'),
    ]

    operations = [
        migrations.CreateModel(
            name='MonthCycle',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('cyclename', models.CharField(max_length=200)),
                ('description', models.CharField(blank=True, max_length=300, null=True)),
                ('slno', models.IntegerField(default=0)),
            ],
            options={
                'db_table': 'monthcycle',
                'ordering': ['slno', 'cyclename'],
            },
        ),
        migrations.CreateModel(
            name='Unit',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('unitname', models.CharField(max_length=100, unique=True)),
            ],
            options={
                'db_table': 'unit',
                'ordering': ['unitname'],
            },
        ),
        migrations.CreateModel(
            name='MonthList',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('monthno', models.IntegerField(unique=True)),
                ('monthname', models.CharField(max_length=20)),
            ],
            options={
                'db_table': 'monthlist',
                'ordering': ['monthno'],
            },
        ),
        migrations.CreateModel(
            name='YearList',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('yearnumber', models.IntegerField(unique=True)),
            ],
            options={
                'db_table': 'yearlist',
                'ordering': ['yearnumber'],
            },
        ),
    ]
