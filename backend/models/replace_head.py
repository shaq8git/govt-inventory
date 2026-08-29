from django.db import models

from ._helpers import _auto_invoiceno
from .customer import Customer
from .month_list import MonthList
from .voucher_code import VoucherCode
from .year_list import YearList


class ReplaceHead(models.Model):
    customer = models.ForeignKey(
        Customer, on_delete=models.PROTECT, related_name="replace_heads"
    )
    vouchercode = models.ForeignKey(
        VoucherCode, on_delete=models.PROTECT, related_name="replace_heads",
        null=True, blank=True
    )
    invoiceno = models.CharField(max_length=20, blank=True)
    saleinvoiceno = models.CharField(max_length=20, blank=True, null=True)
    invoicedate = models.DateField(null=True, blank=True)
    remark = models.CharField(max_length=200, blank=True, null=True)
    monthlist = models.ForeignKey(
        MonthList, on_delete=models.PROTECT, related_name="replace_heads",
        null=True, blank=True
    )
    yearlist = models.ForeignKey(
        YearList, on_delete=models.PROTECT, related_name="replace_heads",
        null=True, blank=True
    )
    cruser_id = models.IntegerField(default=0)
    upduser_id = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "replacehead"
        ordering = ["-invoicedate", "invoiceno"]

    def save(self, *args, **kwargs):
        if not self.pk and not self.invoiceno:
            self.invoiceno = _auto_invoiceno(ReplaceHead, "RPL")
        super().save(*args, **kwargs)

    def __str__(self):
        return self.invoiceno
