from django.db import models

from .issuance_record import IssuanceRecord
from .stock_item import StockItem


class IssuanceLine(models.Model):
    record = models.ForeignKey(IssuanceRecord, on_delete=models.CASCADE, related_name="lines")
    item = models.ForeignKey(StockItem, on_delete=models.PROTECT, related_name="issuance_lines")
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "store_issuanceline"
        ordering = ["item__item_number"]
        unique_together = [("record", "item")]

    def __str__(self):
        return f"{self.record} → {self.item.name} × {self.quantity}"
