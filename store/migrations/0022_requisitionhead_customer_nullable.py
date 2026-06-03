import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('store', '0021_add_requisition_budget'),
    ]

    operations = [
        migrations.AlterField(
            model_name='requisitionhead',
            name='customer',
            field=models.ForeignKey(
                blank=True, null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='requisition_heads',
                to='store.customer',
            ),
        ),
    ]
