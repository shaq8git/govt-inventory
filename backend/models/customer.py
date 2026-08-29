from django.db import models

from .desk import Desk


class Customer(models.Model):
    costname = models.CharField(max_length=50, blank=True, null=True)
    desk = models.ForeignKey(
        Desk, on_delete=models.PROTECT, related_name="customers",
        null=True, blank=True
    )
    contact = models.CharField(max_length=50, blank=True, null=True)
    address = models.CharField(max_length=150, blank=True, null=True)
    shipingadr = models.CharField(max_length=250, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "customer"
        ordering = ["costname"]

    def __str__(self):
        return self.costname or ""
