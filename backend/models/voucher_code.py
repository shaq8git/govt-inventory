from django.db import models


class VoucherCode(models.Model):
    shortname = models.CharField(max_length=5, blank=True, null=True)
    description = models.CharField(max_length=25, blank=True, null=True)

    class Meta:
        db_table = "vouchercode"
        ordering = ["shortname"]

    def __str__(self):
        return f"{self.shortname} - {self.description or ''}"
