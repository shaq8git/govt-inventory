from django.db import models

from .circle_office import CircleOffice


class DistrictOffice(models.Model):
    circleoffice = models.ForeignKey(
        CircleOffice, on_delete=models.PROTECT,
        related_name="district_offices", null=True, blank=True
    )
    districtofficename = models.CharField(max_length=100, default="")
    officeaddress = models.CharField(max_length=200, blank=True, null=True)
    nomanp = models.IntegerField(default=0)
    orderno = models.IntegerField(default=0)

    class Meta:
        db_table = "store_districtoffice"
        ordering = ["orderno", "districtofficename"]

    def __str__(self):
        return self.districtofficename
