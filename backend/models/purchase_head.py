from django.db import models

from .month_list import MonthList
from .supplier import Supplier
from .voucher_code import VoucherCode
from .year_list import YearList


class PurchaseHead(models.Model):
    supplier = models.ForeignKey(
        Supplier, on_delete=models.PROTECT, related_name="purchase_heads"
    )
    vouchercode = models.ForeignKey(
        VoucherCode, on_delete=models.PROTECT, related_name="purchase_heads",
        null=True, blank=True
    )
    invoiceno = models.CharField(max_length=20, blank=True)
    invoicedate = models.DateField(null=True, blank=True)
    remark = models.CharField(max_length=200, blank=True, null=True)
    monthlist = models.ForeignKey(
        MonthList, on_delete=models.PROTECT, related_name="purchase_heads",
        null=True, blank=True
    )
    yearlist = models.ForeignKey(
        YearList, on_delete=models.PROTECT, related_name="purchase_heads",
        null=True, blank=True
    )
    cruser_id = models.IntegerField(default=0)
    upduser_id = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "purchasehead"
        ordering = ["-invoicedate", "invoiceno"]

    def save(self, *args, **kwargs):
        if not self.pk and not self.invoiceno:
            from datetime import date as _date
            ref = self.invoicedate if self.invoicedate else _date.today()
            prefix = ref.strftime("%Y%m%d")
            last = (
                PurchaseHead.objects
                .filter(invoiceno__startswith=prefix)
                .order_by("-invoiceno")
                .first()
            )
            seq = 1
            if last:
                try:
                    seq = int(last.invoiceno[8:]) + 1
                except (ValueError, IndexError):
                    seq = 1
            self.invoiceno = f"{prefix}{seq:03d}"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.invoiceno
