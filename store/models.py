from django.contrib.auth.models import AbstractUser
from django.db import models


class UserRole(models.Model):
    rolename = models.CharField(max_length=250)

    def __str__(self):
        return self.rolename

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
        ordering = ["username"]



class DistrictOffice(models.Model):
    name = models.CharField(max_length=200, unique=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Office(models.Model):
    name = models.CharField(max_length=200)
    district_office = models.ForeignKey(
        DistrictOffice,
        on_delete=models.CASCADE,
        related_name="offices",
        null=True,
        blank=True,
    )

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Category(models.Model):
    """Top-level grouping of stock items (e.g. Paper Supplies, Stationery, Toner)"""
    name = models.CharField(max_length=200, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ["name"]

    def __str__(self):
        return self.name


class StockItem(models.Model):
    UNIT_CHOICES = [
        ("ream", "Ream"),
        ("piece", "Piece"),
        ("box", "Box"),
        ("roll", "Roll"),
        ("set", "Set"),
        ("kg", "Kg"),
        ("litre", "Litre"),
        ("packet", "Packet"),
        ("other", "Other"),
    ]

    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name="items")
    item_number = models.PositiveSmallIntegerField(unique=True, help_text="Serial number from the register (1–118)")
    name = models.CharField(max_length=300)
    unit = models.CharField(max_length=20, choices=UNIT_CHOICES, default="piece")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["item_number"]

    def __str__(self):
        return f"[{self.item_number}] {self.name} ({self.unit})"


class Department(models.Model):
    name = models.CharField(max_length=200, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class IssuanceRecord(models.Model):
    serial_number = models.PositiveIntegerField(help_text="Row serial number from the register")
    date = models.DateField()
    department = models.ForeignKey(Department, on_delete=models.PROTECT, related_name="issuances")
    fiscal_year = models.CharField(max_length=10, default="2025-26")
    month = models.CharField(max_length=20, blank=True)
    sheet_number = models.PositiveSmallIntegerField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-date", "serial_number"]
        constraints = [
            models.UniqueConstraint(
                fields=["serial_number", "date", "department", "fiscal_year", "sheet_number"],
                name="unique_issuance_register_entry",
            )
        ]

    def __str__(self):
        return f"#{self.serial_number} | {self.date} | {self.department}"


class IssuanceLine(models.Model):
    record = models.ForeignKey(IssuanceRecord, on_delete=models.CASCADE, related_name="lines")
    item = models.ForeignKey(StockItem, on_delete=models.PROTECT, related_name="issuance_lines")
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["item__item_number"]
        unique_together = [("record", "item")]

    def __str__(self):
        return f"{self.record} → {self.item.name} × {self.quantity}"

# Create your models here.
