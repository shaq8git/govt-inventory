from rest_framework import serializers
from .models import Category, StockItem, Department, IssuanceRecord, IssuanceLine

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "created_at"]

class StockItemSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = StockItem
        fields = ["id", "item_number", "name", "unit", "category", "category_name", "created_at", "updated_at"]

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ["id", "name", "created_at"]

class IssuanceLineSerializer(serializers.ModelSerializer):
    item_name = serializers.CharField(source="item.name", read_only=True)

    item_number = serializers.IntegerField(source="item.item_number", read_only=True)

    unit = serializers.CharField(source="item.unit", read_only=True)

    class Meta:
        model = IssuanceLine
        fields = ["id", "item", "item_name", "item_number", "unit", "quantity"]

class IssuanceRecordSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source="department.name", read_only=True)
    lines = IssuanceLineSerializer(many=True)

    class Meta:
        model = IssuanceRecord
        fields = ["id", "serial_number", "date", "department", "department_name", "fiscal_year", "month", "sheet_number", "notes", "created_at", "updated_at", "lines"]

    def create(self, validated_data):
        lines_data = validated_data.pop("lines")
        record = IssuanceRecord.objects.create(**validated_data)
        for line_data in lines_data:
            IssuanceLine.objects.create(record=record, **line_data)
        return record

    def update(self, instance, validated_data):
        lines_data = validated_data.pop("lines", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if lines_data is not None:
            instance.lines.all().delete()
            for line_data in lines_data:
                IssuanceLine.objects.create(record=instance, **line_data)   
        return instance

class IssuanceRecordListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views- no nestedlines"""

    department_name = serializers.CharField(source="department.name", read_only=True)
    lines_count = serializers.IntegerField(source="lines.count", read_only=True)

    class Meta:
        model = IssuanceRecord
        fields = ["id", "serial_number", "date", "department", "department_name", "fiscal_year", "month", "sheet_number", "lines_count"]
