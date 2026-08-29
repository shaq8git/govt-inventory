from django.db import models

from .category import Category


class StockItem(models.Model):
    UNIT_CHOICES = [
        ("ream", "Ream"),
        ("piece", "Piece"),
        ("box", "Box"),
        ("roll", "Roll"),
        ("set", "Set"),
        ("kg", "Kg"),
        ("litre", "Litre"),
        ("packet", "Packet"),
        ("other", "Other"),
    ]

    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name="items")
    item_number = models.PositiveSmallIntegerField(unique=True, help_text="Serial number from the register (1–118)")
    name = models.CharField(max_length=300)
    unit = models.CharField(max_length=20, choices=UNIT_CHOICES, default="piece")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "store_stockitem"
        ordering = ["item_number"]

    def __str__(self):
        return f"[{self.item_number}] {self.name} ({self.unit})"
