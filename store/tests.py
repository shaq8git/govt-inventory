from datetime import date

from django.test import TestCase
from rest_framework.test import APIClient

from .models import Category, Department, IssuanceLine, IssuanceRecord, StockItem


class StoreApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.category = Category.objects.create(name="Paper Supplies")
        self.item = StockItem.objects.create(
            category=self.category,
            item_number=1,
            name="A4 Paper",
            unit="ream",
        )
        self.department = Department.objects.create(name="Desk 3")

    def test_create_issuance_record_with_lines(self):
        response = self.client.post(
            "/api/issuance-records/",
            {
                "serial_number": 1,
                "date": "2025-07-03",
                "department": self.department.id,
                "fiscal_year": "2025-26",
                "month": "July",
                "sheet_number": 1,
                "lines": [{"item": self.item.id, "quantity": "7.00"}],
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(IssuanceRecord.objects.count(), 1)
        self.assertEqual(IssuanceLine.objects.get().quantity, 7)

    def test_summary_endpoint(self):
        record = IssuanceRecord.objects.create(
            serial_number=1,
            date=date(2025, 7, 3),
            department=self.department,
            fiscal_year="2025-26",
            month="July",
            sheet_number=1,
        )
        IssuanceLine.objects.create(record=record, item=self.item, quantity=7)

        response = self.client.get("/api/issuance-records/summary/?fiscal_year=2025-26")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["total_issuances"], 1)
        self.assertEqual(response.data["total_items_issued"], 7)
