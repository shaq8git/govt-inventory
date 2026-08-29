from django.db import models

from .product import Product
from .transfer_head import TransferHead


class TransferItem(models.Model):
    transferhead = models.ForeignKey(
        TransferHead, on_delete=models.CASCADE, related_name="items"
    )
    product = models.ForeignKey(
        Product, on_delete=models.PROTECT, related_name="transfer_items"
    )
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    opnbalance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    clbalance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    purrate = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    transrate = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    transprice = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    cruser_id = models.IntegerField(default=0)
    upduser_id = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "tranferitem"
        ordering = ["product__productname"]

    def __str__(self):
        return f"{self.transferhead.invoiceno} — {self.product.productname}"
