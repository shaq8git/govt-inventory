from django.db import models


class Status(models.Model):
    statusname = models.CharField(max_length=100, unique=True)

    class Meta:
        db_table = "status"
        ordering = ["id"]

    def __str__(self):
        return self.statusname
