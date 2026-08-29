from django.db import models

from .product import Product
from .replace_head import ReplaceHead


class ReplaceItem(models.Model):
    replacehead = models.ForeignKey(
        ReplaceHead, on_delete=models.CASCADE, related_name="items"
    )
    product = models.ForeignKey(
        Product, on_delete=models.PROTECT, related_name="replace_items"
    )
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    opnbalance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    clbalance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    purrate = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    replacerate = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    replaceprice = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    cruser_id = models.IntegerField(default=0)
    upduser_id = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "replaceitem"
        ordering = ["product__productname"]

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        if is_new:
            Product.objects.filter(pk=self.product_id).update(
                currentqty=models.F("currentqty") - self.quantity
            )

    def delete(self, *args, **kwargs):
        Product.objects.filter(pk=self.product_id).update(
            currentqty=models.F("currentqty") + self.quantity
        )
        super().delete(*args, **kwargs)

    def __str__(self):
        return f"{self.replacehead.invoiceno} — {self.product.productname}"
