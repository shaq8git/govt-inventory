from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from .models import Category, Department, IssuanceLine, IssuanceRecord, StockItem, User
from django.contrib.auth.models import Group

admin.site.unregister(Group)

@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    fieldsets = DjangoUserAdmin.fieldsets + (
        (
            "Store user info edit form",
            {
                "fields": (
                    "designation",
                    "office_id",
                    "districtoffice_id",
                    "aprflag",
                    "mobileno",
                    "status_id",
                    "otpdate",
                    "lotpno",
                )
            },
        ),
    )
    add_fieldsets = DjangoUserAdmin.add_fieldsets + (
        (
            "Store user info create form",
            {
                "fields": (
                    "email",
                    "designation",
                    "office_id",
                    "districtoffice_id",
                    "mobileno",
                    "status_id",
                )
            },
        ),
    )
    list_display = ["username", "email", "designation", "mobileno", "is_staff", "is_active"]
    search_fields = ["username", "email", "first_name", "last_name", "designation", "mobileno"]
    list_filter = DjangoUserAdmin.list_filter + ("status_id", "aprflag")


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    search_fields = ["name"]
    list_display = ["name", "created_at"]


@admin.register(StockItem)
class StockItemAdmin(admin.ModelAdmin):
    list_display = ["item_number", "name", "unit", "category"]
    list_filter = ["category", "unit"]
    search_fields = ["name", "item_number"]
    ordering = ["item_number"]


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    search_fields = ["name"]
    list_display = ["name", "created_at"]


class IssuanceLineInline(admin.TabularInline):
    model = IssuanceLine
    extra = 0
    autocomplete_fields = ["item"]


@admin.register(IssuanceRecord)
class IssuanceRecordAdmin(admin.ModelAdmin):
    list_display = ["serial_number", "date", "department", "fiscal_year", "month", "sheet_number"]
    list_filter = ["fiscal_year", "month", "department"]
    search_fields = ["serial_number", "department__name"]
    date_hierarchy = "date"
    autocomplete_fields = ["department"]
    inlines = [IssuanceLineInline]
