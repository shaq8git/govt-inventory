from django.contrib.auth.models import AbstractUser
from django.db import models

from .user_role import UserRole


class User(AbstractUser):
    email = models.EmailField(unique=True)
    designation = models.CharField(max_length=200, blank=True)
    office_id = models.PositiveIntegerField(default=0)
    districtoffice_id = models.PositiveIntegerField(default=0)
    aprflag = models.PositiveSmallIntegerField(default=0)
    mobileno = models.CharField(max_length=25, blank=True)
    status_id = models.PositiveSmallIntegerField(default=1)
    otpdate = models.DateField(null=True, blank=True)
    lotpno = models.DateField(null=True, blank=True)
    userrole = models.ForeignKey(
        UserRole,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    REQUIRED_FIELDS = ["email"]

    class Meta:
        db_table = "store_user"
        ordering = ["username"]
