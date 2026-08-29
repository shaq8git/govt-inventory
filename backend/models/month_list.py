from django.db import models


class MonthList(models.Model):
    monthno = models.IntegerField(unique=True)
    monthname = models.CharField(max_length=20)

    class Meta:
        db_table = "monthlist"
        ordering = ["monthno"]

    def __str__(self):
        return self.monthname
