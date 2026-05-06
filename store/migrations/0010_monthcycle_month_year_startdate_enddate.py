from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('store', '0009_monthcycle_unit_monthlist_yearlist'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='monthcycle',
            name='description',
        ),
        migrations.AddField(
            model_name='monthcycle',
            name='month',
            field=models.ForeignKey(
                blank=True, null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='cycles',
                to='store.monthlist',
            ),
        ),
        migrations.AddField(
            model_name='monthcycle',
            name='year',
            field=models.ForeignKey(
                blank=True, null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='cycles',
                to='store.yearlist',
            ),
        ),
        migrations.AddField(
            model_name='monthcycle',
            name='startdate',
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='monthcycle',
            name='enddate',
            field=models.DateField(blank=True, null=True),
        ),
    ]
