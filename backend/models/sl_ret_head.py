from django.db import models

from .customer import Customer
from .month_list import MonthList
from .voucher_code import VoucherCode
from .year_list import YearList


class SlRetHead(models.Model):
    customer = models.ForeignKey(
        Customer, on_delete=models.PROTECT, related_name="slret_heads"
    )
    vouchercode = models.ForeignKey(
        VoucherCode, on_delete=models.PROTECT, related_name="slret_heads",
        null=True, blank=True
    )
    invoiceno = models.CharField(max_length=20, blank=True)
    saleinvoiceno = models.CharField(max_length=20, blank=True, null=True)
    invoicedate = models.DateField(null=True, blank=True)
    remark = models.CharField(max_length=200, blank=True, null=True)
    monthlist = models.ForeignKey(
        MonthList, on_delete=models.PROTECT, related_name="slret_heads",
        null=True, blank=True
    )
    yearlist = models.ForeignKey(
        YearList, on_delete=models.PROTECT, related_name="slret_heads",
        null=True, blank=True
    )
    cruser_id = models.IntegerField(default=0)
    upduser_id = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "slrethead"
        ordering = ["-invoicedate", "invoiceno"]

    def save(self, *args, **kwargs):
        if not self.pk and not self.invoiceno:
            from datetime import date as _date
            ref = self.invoicedate if self.invoicedate else _date.today()
            prefix = ref.strftime("%Y%m%d")
            last = (
                SlRetHead.objects
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
