from django.db import models


class MonthCycle(models.Model):
    cyclename = models.CharField(max_length=200)
    month = models.ForeignKey(
        "MonthList", on_delete=models.PROTECT, related_name="cycles", null=True, blank=True
    )
    year = models.ForeignKey(
        "YearList", on_delete=models.PROTECT, related_name="cycles", null=True, blank=True
    )
    startdate = models.DateField(null=True, blank=True)
    enddate = models.DateField(null=True, blank=True)
    slno = models.IntegerField(default=0)

    class Meta:
        db_table = "monthcycle"
        ordering = ["slno", "cyclename"]

    def __str__(self):
        return self.cyclename
