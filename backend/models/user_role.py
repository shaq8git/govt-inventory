from django.db import models


class UserRole(models.Model):
    rolename = models.CharField(max_length=250)

    class Meta:
        db_table = "store_userrole"

    def __str__(self):
        return self.rolename
