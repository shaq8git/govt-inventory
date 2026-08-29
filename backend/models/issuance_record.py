from django.db import models

from .department import Department


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
        db_table = "store_issuancerecord"
        ordering = ["-date", "serial_number"]
        constraints = [
            models.UniqueConstraint(
                fields=["serial_number", "date", "department", "fiscal_year", "sheet_number"],
                name="unique_issuance_register_entry",
            )
        ]

    def __str__(self):
        return f"#{self.serial_number} | {self.date} | {self.department}"
