from django.db import models

from .product import Product
from .requisition_head import RequisitionHead


class RequisitionItem(models.Model):
    requisitionhead = models.ForeignKey(
        RequisitionHead, on_delete=models.CASCADE, related_name="items"
    )
    product = models.ForeignKey(
        Product, on_delete=models.PROTECT, related_name="requisition_items"
    )
    primquantity = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    reqquantity = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    requserinfo_id = models.IntegerField(default=0)
    approveuserinfo_id = models.IntegerField(default=0)
    approvflag = models.SmallIntegerField(default=0)
    approvdate = models.DateField(null=True, blank=True)
    cruser_id = models.IntegerField(default=0)
    upduser_id = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "requisitionitem"
        ordering = ["product__productname"]

    def __str__(self):
        return f"{self.requisitionhead.requisitionno} — {self.product.productname}"
