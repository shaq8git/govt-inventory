from django.db import models


class Department(models.Model):
    name = models.CharField(max_length=200, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "store_department"
        ordering = ["name"]

    def __str__(self):
        return self.name
