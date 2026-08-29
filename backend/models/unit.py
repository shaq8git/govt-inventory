from django.db import models


class Unit(models.Model):
    unitname = models.CharField(max_length=100, unique=True)

    class Meta:
        db_table = "unit"
        ordering = ["unitname"]

    def __str__(self):
        return self.unitname
