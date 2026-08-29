from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0010_monthcycle_month_year_startdate_enddate'),
    ]

    operations = [
        migrations.CreateModel(
            name='Status',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('statusname', models.CharField(max_length=100, unique=True)),
            ],
            options={
                'db_table': 'status',
                'ordering': ['id'],
            },
        ),
        migrations.RemoveField(
            model_name='product',
            name='specification',
        ),
        migrations.RemoveField(
            model_name='product',
            name='slno',
        ),
        migrations.RemoveField(
            model_name='product',
            name='status_id',
        ),
        migrations.AddField(
            model_name='product',
            name='openflag',
            field=models.SmallIntegerField(default=0),
        ),
        migrations.AddField(
            model_name='product',
            name='mrp',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=12),
        ),
        migrations.AddField(
            model_name='product',
            name='status',
            field=models.ForeignKey(
                blank=True, null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='products',
                to='backend.status',
            ),
        ),
        migrations.AlterModelOptions(
            name='product',
            options={'ordering': ['productname']},
        ),
    ]
