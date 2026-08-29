from django.db import models

from .mfccompany import Mfccompany
from .product_group import ProductGroup
from .status import Status


class Product(models.Model):
    prodcode = models.IntegerField(unique=True)
    productname = models.CharField(max_length=300)
    productgroup = models.ForeignKey(
        ProductGroup, on_delete=models.PROTECT, related_name="products"
    )
    mfccompany = models.ForeignKey(
        Mfccompany, on_delete=models.PROTECT, related_name="products", null=True, blank=True
    )
    unit = models.CharField(max_length=50, blank=True, null=True)
    openqty = models.IntegerField(default=0)
    openqtyyear_id = models.IntegerField(default=0)
    currentqty = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    currentqtyyear_id = models.IntegerField(default=0)
    openflag = models.SmallIntegerField(default=0)
    purchaserate = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    salesrate = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    salesdiscountrate = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    mrp = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status = models.ForeignKey(
        Status, on_delete=models.PROTECT, related_name="products", null=True, blank=True
    )

    class Meta:
        db_table = "product"
        ordering = ["productname"]

    def save(self, *args, **kwargs):
        if not self.pk and not self.prodcode:
            group_prefix = self.productgroup.groupcode
            last = (
                Product.objects.filter(productgroup=self.productgroup)
                .order_by("-prodcode")
                .first()
            )
            if last:
                self.prodcode = last.prodcode + 1
            else:
                self.prodcode = int(f"{group_prefix}1001")
        super().save(*args, **kwargs)

    def __str__(self):
        return self.productname
