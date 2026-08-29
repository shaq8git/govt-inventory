from django.db import models

from .district_office import DistrictOffice


class Office(models.Model):
    districtoffice = models.ForeignKey(
        DistrictOffice, on_delete=models.PROTECT,
        related_name="offices", null=True, blank=True
    )
    officename = models.CharField(max_length=100, blank=True, null=True)
    officeaddress = models.CharField(max_length=200, blank=True, null=True)
    activity = models.IntegerField(default=0)
    orderno = models.IntegerField(default=0)

    class Meta:
        db_table = "store_office"
        ordering = ["orderno", "officename"]

    def __str__(self):
        return self.officename or ""
