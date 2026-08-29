from django.db import models


class ProductGroup(models.Model):
    groupcode = models.IntegerField(unique=True)
    groupname = models.CharField(max_length=200)
    slno = models.IntegerField(default=0)

    class Meta:
        db_table = "productgroup"
        ordering = ["slno", "groupname"]

    def save(self, *args, **kwargs):
        if not self.pk and not self.groupcode:
            last = ProductGroup.objects.order_by("-groupcode").first()
            self.groupcode = (last.groupcode + 1) if last else 100
        super().save(*args, **kwargs)

    def __str__(self):
        return self.groupname
