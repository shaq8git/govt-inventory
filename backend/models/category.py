from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=200, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "store_category"
        verbose_name_plural = "Categories"
        ordering = ["name"]

    def __str__(self):
        return self.name
