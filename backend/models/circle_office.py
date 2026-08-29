from django.db import models


class CircleOffice(models.Model):
    circleofficename = models.CharField(max_length=100)
    officeaddress = models.CharField(max_length=250, blank=True, null=True)
    headoffice_id = models.IntegerField(default=0)
    slno = models.IntegerField(default=0)

    class Meta:
        db_table = "circleoffice"
        ordering = ["slno"]

    def __str__(self):
        return self.circleofficename
