from django.db import models


class Division(models.Model):
    divcode = models.CharField(max_length=3)
    divisionname = models.CharField(max_length=100)

    class Meta:
        db_table = "division"
        ordering = ["id"]

    def __str__(self):
        return self.divisionname
