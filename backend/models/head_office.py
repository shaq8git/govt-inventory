from django.db import models


class HeadOffice(models.Model):
    officename = models.CharField(max_length=200)
    address = models.CharField(max_length=300, blank=True, null=True)

    class Meta:
        db_table = "headoffice"

    def __str__(self):
        return self.officename
