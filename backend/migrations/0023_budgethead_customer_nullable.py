import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0022_requisitionhead_customer_nullable'),
    ]

    operations = [
        migrations.AlterField(
            model_name='budgethead',
            name='customer',
            field=models.ForeignKey(
                blank=True, null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='budget_heads',
                to='backend.customer',
            ),
        ),
    ]
