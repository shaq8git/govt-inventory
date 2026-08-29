from django.db import models


class Designation(models.Model):
    designationname = models.CharField(max_length=100)
    class_field = models.CharField(max_length=50, db_column="class", default="0", blank=True)
    grade_id = models.IntegerField(default=0)
    nopost = models.IntegerField(default=0)
    desigslno = models.IntegerField(default=0)
    officerornot_id = models.IntegerField(default=0)

    class Meta:
        db_table = "designation"
        ordering = ["desigslno"]

    def __str__(self):
        return self.designationname
