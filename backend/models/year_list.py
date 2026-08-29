from django.db import models


class YearList(models.Model):
    yearnumber = models.IntegerField(unique=True)

    class Meta:
        db_table = "yearlist"
        ordering = ["yearnumber"]

    def __str__(self):
        return str(self.yearnumber)
