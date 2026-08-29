from django.db import models


class Desk(models.Model):
    deskname = models.CharField(max_length=50, blank=True, null=True)
    location = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        db_table = "desk"
        ordering = ["deskname"]

    def __str__(self):
        return self.deskname or ""
