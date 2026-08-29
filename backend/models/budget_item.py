from django.db import models

from .budget_head import BudgetHead
from .product import Product


class BudgetItem(models.Model):
    budgethead = models.ForeignKey(
        BudgetHead, on_delete=models.CASCADE, related_name="items"
    )
    product = models.ForeignKey(
        Product, on_delete=models.PROTECT, related_name="budget_items"
    )
    primquantity = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    primpurrate = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    bdgquantity = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    bdgpurrate = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    bdguserinfo_id = models.IntegerField(default=0)
    approveuserinfo_id = models.IntegerField(default=0)
    approvflag = models.SmallIntegerField(default=0)
    approvdate = models.DateField(null=True, blank=True)
    cruser_id = models.IntegerField(default=0)
    upduser_id = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "budgetitem"
        ordering = ["product__productname"]

    def __str__(self):
        return f"{self.budgethead.budgetno} — {self.product.productname}"
