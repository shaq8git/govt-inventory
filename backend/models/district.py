from django.db import models

from .division import Division


class District(models.Model):
    division = models.ForeignKey(Division, on_delete=models.PROTECT, related_name="districts")
    districtname = models.CharField(max_length=100)

    class Meta:
        db_table = "district"
        ordering = ["districtname"]

    def __str__(self):
        return self.districtname
