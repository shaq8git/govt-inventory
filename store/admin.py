from django.contrib import admin
from .models import Category, Department, IssuanceLine, IssuanceRecord, StockItem


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
