from django.db import models


class Mfccompany(models.Model):
    companyname = models.CharField(max_length=200)
    address = models.CharField(max_length=300, blank=True, null=True)
    contactno = models.CharField(max_length=50, blank=True, null=True)
    status_id = models.SmallIntegerField(default=1)

    class Meta:
        db_table = "mfccompany"
        ordering = ["companyname"]

    def __str__(self):
        return self.companyname
