from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum, Count
from .models import Category, StockItem, Department, IssuanceRecord, IssuanceLine
from .serializers import (CategorySerializer, StockItemSerializer, DepartmentSerializer, IssuanceRecordSerializer, IssuanceRecordListSerializer)

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["name"]

class StockItemViewSet(viewsets.ModelViewSet):  
    queryset = StockItem.objects.select_related("category").all()
    serializer_class = StockItemSerializer
    filter_backends = [filters.SearchFilter, DjangoFilterBackend, filters.OrderingFilter]
    search_fields = ["name", "item_number"]
    filterset_fields = ["category", "unit"]
    ordering_fields = ["item_number", "name"] 

    @action(detail=True, methods=["get"])
    def usage(self, request, pk=None):
        """Total quantity issued for this item, optionally filtered by fiscal year"""
        fiscal_year = request.query_params.get("fiscal_year")
        item = self.get_object()
        qs = IssuanceLine.objects.filter(item=item)
        if fiscal_year:
            qs = qs.filter(record__fiscal_year=fiscal_year)
        total = qs.aggregate(total=Sum("quantity"))["total"] or 0
        by_dept = (
            qs.values("record__department__name")
            .annotate(total=Sum("quantity"))
            .order_by("-total")
        )
        return Response({"item": item.name, "total_issued": total, "by_department": list(by_dept)})
    
class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["name"]

    @action(detail=True, methods=["get"])
    def history(self, request, pk=None):
        """Issuance history for a department"""
        dept = self.get_object()
        records = IssuanceRecord.objects.filter(department=dept).prefetch_related("lines__item")
        serializer = IssuanceRecordSerializer(records, many=True)
        return Response(serializer.data)

class IssuanceRecordViewSet(viewsets.ModelViewSet):
    queryset = IssuanceRecord.objects.select_related("department").prefetch_related("lines__item").all()
    serializer_class = IssuanceRecordSerializer
    filter_backends = [filters.SearchFilter, DjangoFilterBackend, filters.OrderingFilter]
    search_fields = ["serial_number", "department__name"]
    filterset_fields = ["fiscal_year", "month", "department", "date"]
    ordering_fields = ["date", "serial_number"]

    def get_serializer_class(self): 
        if self.action == "list":
            return IssuanceRecordListSerializer
        return IssuanceRecordSerializer
    
    @action(detail=False, methods=["get"])
    def summary(self, request): 
        """Aggregate summary: total records, departments, and items issued."""
        fiscal_year = request.query_params.get("fiscal_year", "2025-26")
        qs = IssuanceRecord.objects.filter(fiscal_year=fiscal_year)
        data = {
            "fiscal_year": fiscal_year,
            "total_issuances": qs.count(),
            "total_departments": qs.values("department").distinct().count(),
            "total_items_issued": IssuanceLine.objects.filter(record__fiscal_year=fiscal_year)
            .aggregate(total=Sum("quantity"))["total"] or 0,
            "top_items": list(
                IssuanceLine.objects.filter(record__fiscal_year=fiscal_year)
                .values("item__name", "item__item_number")
                .annotate(total=Sum("quantity"))
                .order_by("-total")[:10]
            ),
            "top_departments": list(
                qs.values("department__name")
                .annotate(total=Count("id"))
                .order_by("-total")[:10]
            ),  
        }
        return Response(data)
