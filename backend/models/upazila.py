from django.db import models

from .district import District
from .division import Division


class Upazila(models.Model):
    district = models.ForeignKey(
        District, on_delete=models.PROTECT,
        related_name="upazilas", null=True, blank=True
    )
    division = models.ForeignKey(
        Division, on_delete=models.PROTECT,
        related_name="upazilas", null=True, blank=True
    )
    upazilaname = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        db_table = "upazila"
        ordering = ["upazilaname"]

    def __str__(self):
        return self.upazilaname or ""
