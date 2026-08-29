from django.db import models

from .customer import Customer
from .month_list import MonthList
from .voucher_code import VoucherCode
from .year_list import YearList


class BudgetHead(models.Model):
    customer = models.ForeignKey(
        Customer, on_delete=models.PROTECT, related_name="budget_heads",
        null=True, blank=True
    )
    vouchercode = models.ForeignKey(
        VoucherCode, on_delete=models.PROTECT, related_name="budget_heads",
        null=True, blank=True
    )
    budgetno = models.CharField(max_length=20, blank=True)
    budgetdate = models.DateField(null=True, blank=True)
    remark = models.CharField(max_length=200, blank=True, null=True)
    monthlist = models.ForeignKey(
        MonthList, on_delete=models.PROTECT, related_name="budget_heads",
        null=True, blank=True
    )
    yearlist = models.ForeignKey(
        YearList, on_delete=models.PROTECT, related_name="budget_heads",
        null=True, blank=True
    )
    cruser_id = models.IntegerField(default=0)
    upduser_id = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "budgethead"
        ordering = ["-budgetdate", "budgetno"]

    def save(self, *args, **kwargs):
        if not self.pk and not self.budgetno:
            from datetime import date as _date
            ref = self.budgetdate if self.budgetdate else _date.today()
            prefix = ref.strftime("%Y%m%d")
            last = (
                BudgetHead.objects
                .filter(budgetno__startswith=prefix)
                .order_by("-budgetno")
                .first()
            )
            seq = 1
            if last:
                try:
                    seq = int(last.budgetno[8:]) + 1
                except (ValueError, IndexError):
                    seq = 1
            self.budgetno = f"{prefix}{seq:03d}"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.budgetno
