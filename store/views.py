from django.contrib.auth import get_user_model
from rest_framework import viewsets, filters, status
from rest_framework.authtoken.models import Token
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum, Count, Q
from .models import Category, StockItem, Department, IssuanceRecord, IssuanceLine, UserRole, CircleOffice, DistrictOffice, Office, HeadOffice, Designation, ProductGroup, Mfccompany, Product, MonthCycle, Unit, MonthList, YearList, Status, VoucherCode, Supplier, PurchaseHead, PurchaseItem, Desk, PurRetHead, PurRetItem, Customer, SalesHead, SalesItem, SlRetHead, SlRetItem, ReplaceHead, ReplaceItem, TransferHead, TransferItem, DamageHead, DamageItem
from .serializers import (
    CategorySerializer,
    CircleOfficeSerializer,
    DepartmentSerializer,
    DesignationSerializer,
    DistrictOfficeSerializer,
    HeadOfficeSerializer,
    MfccompanySerializer,
    MonthCycleSerializer,
    MonthListSerializer,
    OfficeSerializer,
    ProductGroupSerializer,
    ProductSerializer,
    StatusSerializer,
    UnitSerializer,
    UserRoleSerializer,
    YearListSerializer,
    IssuanceRecordSerializer,
    IssuanceRecordListSerializer,
    LoginSerializer,
    StockItemSerializer,
    UserRegistrationSerializer,
    UserSerializer,
    VoucherCodeSerializer,
    SupplierSerializer,
    PurchaseHeadSerializer,
    PurchaseHeadListSerializer,
    PurchaseItemCreateSerializer,
    PurchaseReportSerializer,
    DeskSerializer,
    PurRetHeadSerializer,
    PurRetHeadListSerializer,
    PurRetItemCreateSerializer,
    CustomerSerializer,
    SalesHeadSerializer,
    SalesHeadListSerializer,
    SalesItemCreateSerializer,
    SalesReportSerializer,
    SlRetHeadSerializer,
    SlRetHeadListSerializer,
    SlRetItemCreateSerializer,
    ReplaceHeadSerializer,
    ReplaceHeadListSerializer,
    ReplaceItemCreateSerializer,
    TransferHeadSerializer,
    TransferHeadListSerializer,
    TransferItemCreateSerializer,
    DamageHeadSerializer,
    DamageHeadListSerializer,
    DamageItemCreateSerializer,
)

User = get_user_model()


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.prefetch_related("groups").all()
    serializer_class = UserSerializer
    filter_backends = [filters.SearchFilter, DjangoFilterBackend, filters.OrderingFilter]
    search_fields = ["username", "email", "first_name", "last_name", "designation", "mobileno"]
    filterset_fields = ["groups", "office_id", "districtoffice_id", "status_id", "aprflag", "is_active"]
    ordering_fields = ["username", "email", "date_joined"]

    def get_permissions(self):
        if self.action in {"register", "login"}:
            return [AllowAny()]
        if self.action in {"me", "logout"}:
            return [IsAuthenticated()]
        return super().get_permissions()

    def get_serializer_class(self):
        if self.action == "register":
            return UserRegistrationSerializer
        if self.action == "login":
            return LoginSerializer
        return UserSerializer

    @action(detail=False, methods=["post"], permission_classes=[AllowAny])
    def register(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, _created = Token.objects.get_or_create(user=user)
        return Response(
            {"token": token.key, "user": UserSerializer(user).data},
            status=status.HTTP_201_CREATED,
        )

    @action(detail=False, methods=["post"], permission_classes=[AllowAny])
    def login(self, request):
        serializer = LoginSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        token, _created = Token.objects.get_or_create(user=user)
        return Response({"token": token.key, "user": UserSerializer(user).data})

    @action(detail=False, methods=["post"], permission_classes=[IsAuthenticated])
    def logout(self, request):
        Token.objects.filter(user=request.user).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def me(self, request):
        return Response(UserSerializer(request.user).data)

class HeadOfficeViewSet(viewsets.ModelViewSet):
    queryset = HeadOffice.objects.all()
    serializer_class = HeadOfficeSerializer
    permission_classes = [AllowAny]
    pagination_class = None


class CircleOfficeViewSet(viewsets.ModelViewSet):
    queryset = CircleOffice.objects.all()
    serializer_class = CircleOfficeSerializer
    permission_classes = [AllowAny]
    pagination_class = None
    filter_backends = [filters.SearchFilter]
    search_fields = ["circleofficename", "officeaddress"]


class DistrictOfficeViewSet(viewsets.ModelViewSet):
    queryset = DistrictOffice.objects.all()
    serializer_class = DistrictOfficeSerializer
    permission_classes = [AllowAny]
    pagination_class = None
    filter_backends = [filters.SearchFilter]
    search_fields = ["districtofficename", "officeaddress"]


class OfficeViewSet(viewsets.ModelViewSet):
    queryset = Office.objects.select_related("districtoffice").all()
    serializer_class = OfficeSerializer
    permission_classes = [AllowAny]
    pagination_class = None
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["districtoffice"]
    search_fields = ["officename"]


class DesignationViewSet(viewsets.ModelViewSet):
    queryset = Designation.objects.all()
    serializer_class = DesignationSerializer
    permission_classes = [AllowAny]
    pagination_class = None
    filter_backends = [filters.SearchFilter]
    search_fields = ["designationname", "class_field"]


class UserRoleViewSet(viewsets.ModelViewSet):
    queryset = UserRole.objects.all().order_by("id")
    serializer_class = UserRoleSerializer
    permission_classes = [AllowAny]
    pagination_class = None
    filter_backends = [filters.SearchFilter]
    search_fields = ["rolename"]


""" class GroupViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Group.objects.all().order_by("id", "name")
    serializer_class = GroupSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["name"] """

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

class StatusViewSet(viewsets.ModelViewSet):
    queryset = Status.objects.all()
    serializer_class = StatusSerializer
    permission_classes = [AllowAny]
    pagination_class = None
    filter_backends = [filters.SearchFilter]
    search_fields = ["statusname"]


class MonthCycleViewSet(viewsets.ModelViewSet):
    queryset = MonthCycle.objects.all()
    serializer_class = MonthCycleSerializer
    permission_classes = [AllowAny]
    pagination_class = None
    filter_backends = [filters.SearchFilter]
    search_fields = ["cyclename"]


class UnitViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Unit.objects.all()
    serializer_class = UnitSerializer
    permission_classes = [AllowAny]
    pagination_class = None


class MonthListViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = MonthList.objects.all()
    serializer_class = MonthListSerializer
    permission_classes = [AllowAny]
    pagination_class = None


class YearListViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = YearList.objects.all()
    serializer_class = YearListSerializer
    permission_classes = [AllowAny]
    pagination_class = None


class ProductGroupViewSet(viewsets.ModelViewSet):
    queryset = ProductGroup.objects.all()
    serializer_class = ProductGroupSerializer
    permission_classes = [AllowAny]
    pagination_class = None
    filter_backends = [filters.SearchFilter]
    search_fields = ["groupname"]


class MfccompanyViewSet(viewsets.ModelViewSet):
    queryset = Mfccompany.objects.all()
    serializer_class = MfccompanySerializer
    permission_classes = [AllowAny]
    pagination_class = None
    filter_backends = [filters.SearchFilter]
    search_fields = ["companyname"]


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.select_related("productgroup", "mfccompany").all()
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]
    pagination_class = None
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["productgroup", "status_id"]
    search_fields = ["productname", "specification"]


class VoucherCodeViewSet(viewsets.ModelViewSet):
    queryset = VoucherCode.objects.all()
    serializer_class = VoucherCodeSerializer
    permission_classes = [AllowAny]
    pagination_class = None
    filter_backends = [filters.SearchFilter]
    search_fields = ["shortname", "description"]


class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    permission_classes = [AllowAny]
    pagination_class = None
    filter_backends = [filters.SearchFilter]
    search_fields = ["supname", "contact", "address"]


class PurchaseItemViewSet(viewsets.ModelViewSet):
    queryset = PurchaseItem.objects.select_related(
        "product__productgroup", "purchasehead__supplier"
    ).all()
    permission_classes = [AllowAny]
    pagination_class = None
    filter_backends = [DjangoFilterBackend]
    filterset_fields = {
        "purchasehead": ["exact"],
        "product": ["exact"],
        "product__productgroup": ["exact"],
        "purchasehead__invoicedate": ["exact", "gte", "lte"],
    }

    def get_serializer_class(self):
        if self.action == "list":
            return PurchaseReportSerializer
        return PurchaseItemCreateSerializer


class PurchaseHeadViewSet(viewsets.ModelViewSet):
    queryset = PurchaseHead.objects.select_related(
        "supplier", "vouchercode", "monthlist", "yearlist"
    ).prefetch_related("items__product").all()
    permission_classes = [AllowAny]
    pagination_class = None
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ["invoiceno", "supplier__supname"]
    filterset_fields = {
        "supplier": ["exact"],
        "monthlist": ["exact"],
        "yearlist": ["exact"],
        "items__product": ["exact"],
        "invoicedate": ["exact", "gte", "lte"],
    }

    def get_serializer_class(self):
        if self.action == "list":
            return PurchaseHeadListSerializer
        return PurchaseHeadSerializer


class DeskViewSet(viewsets.ModelViewSet):
    queryset = Desk.objects.all()
    serializer_class = DeskSerializer
    permission_classes = [AllowAny]
    pagination_class = None
    filter_backends = [filters.SearchFilter]
    search_fields = ["deskname", "location"]


class PurRetItemViewSet(viewsets.ModelViewSet):
    queryset = PurRetItem.objects.select_related("product", "purrethead").all()
    serializer_class = PurRetItemCreateSerializer
    permission_classes = [AllowAny]
    pagination_class = None
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["purrethead"]


class PurRetHeadViewSet(viewsets.ModelViewSet):
    queryset = PurRetHead.objects.select_related(
        "supplier", "vouchercode", "monthlist", "yearlist"
    ).prefetch_related("items__product").all()
    permission_classes = [AllowAny]
    pagination_class = None
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ["invoiceno", "supplier__supname"]
    filterset_fields = ["supplier", "monthlist", "yearlist"]

    def get_serializer_class(self):
        if self.action == "list":
            return PurRetHeadListSerializer
        return PurRetHeadSerializer


class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.select_related("desk").all()
    serializer_class = CustomerSerializer
    permission_classes = [AllowAny]
    pagination_class = None
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ["costname", "contact", "address"]
    filterset_fields = ["desk"]


class SalesItemViewSet(viewsets.ModelViewSet):
    queryset = SalesItem.objects.select_related(
        "product__productgroup", "saleshead__customer"
    ).all()
    permission_classes = [AllowAny]
    pagination_class = None
    filter_backends = [DjangoFilterBackend]
    filterset_fields = {
        "saleshead": ["exact"],
        "product": ["exact"],
        "product__productgroup": ["exact"],
        "saleshead__invoicedate": ["exact", "gte", "lte"],
    }

    def get_serializer_class(self):
        if self.action == "list":
            return SalesReportSerializer
        return SalesItemCreateSerializer


class SalesHeadViewSet(viewsets.ModelViewSet):
    queryset = SalesHead.objects.select_related("customer", "vouchercode", "monthlist", "yearlist").prefetch_related("items__product").all()
    permission_classes = [AllowAny]
    pagination_class = None
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ["invoiceno", "customer__costname"]
    filterset_fields = {
        "customer": ["exact"],
        "monthlist": ["exact"],
        "yearlist": ["exact"],
        "invoicedate": ["exact", "gte", "lte"],
    }

    def get_serializer_class(self):
        if self.action == "list":
            return SalesHeadListSerializer
        return SalesHeadSerializer


class SlRetItemViewSet(viewsets.ModelViewSet):
    queryset = SlRetItem.objects.select_related("product", "slrethead").all()
    serializer_class = SlRetItemCreateSerializer
    permission_classes = [AllowAny]
    pagination_class = None
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["slrethead"]


class SlRetHeadViewSet(viewsets.ModelViewSet):
    queryset = SlRetHead.objects.select_related("customer", "vouchercode", "monthlist", "yearlist").prefetch_related("items__product").all()
    permission_classes = [AllowAny]
    pagination_class = None
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ["invoiceno", "customer__costname"]
    filterset_fields = ["customer", "monthlist", "yearlist"]

    def get_serializer_class(self):
        if self.action == "list":
            return SlRetHeadListSerializer
        return SlRetHeadSerializer


class ReplaceItemViewSet(viewsets.ModelViewSet):
    queryset = ReplaceItem.objects.select_related("product", "replacehead").all()
    serializer_class = ReplaceItemCreateSerializer
    permission_classes = [AllowAny]
    pagination_class = None
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["replacehead"]


class ReplaceHeadViewSet(viewsets.ModelViewSet):
    queryset = ReplaceHead.objects.select_related("customer", "vouchercode", "monthlist", "yearlist").prefetch_related("items__product").all()
    permission_classes = [AllowAny]
    pagination_class = None
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ["invoiceno", "customer__costname"]
    filterset_fields = ["customer", "monthlist", "yearlist"]

    def get_serializer_class(self):
        if self.action == "list":
            return ReplaceHeadListSerializer
        return ReplaceHeadSerializer


class TransferItemViewSet(viewsets.ModelViewSet):
    queryset = TransferItem.objects.select_related("product", "transferhead").all()
    serializer_class = TransferItemCreateSerializer
    permission_classes = [AllowAny]
    pagination_class = None
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["transferhead"]


class TransferHeadViewSet(viewsets.ModelViewSet):
    queryset = TransferHead.objects.select_related("fromcustomer", "tocustomer", "vouchercode", "monthlist", "yearlist").prefetch_related("items__product").all()
    permission_classes = [AllowAny]
    pagination_class = None
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ["invoiceno", "fromcustomer__costname", "tocustomer__costname"]
    filterset_fields = ["fromcustomer", "tocustomer", "monthlist", "yearlist"]

    def get_serializer_class(self):
        if self.action == "list":
            return TransferHeadListSerializer
        return TransferHeadSerializer


class DamageItemViewSet(viewsets.ModelViewSet):
    queryset = DamageItem.objects.select_related("product", "damagehead").all()
    serializer_class = DamageItemCreateSerializer
    permission_classes = [AllowAny]
    pagination_class = None
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["damagehead"]


class DamageHeadViewSet(viewsets.ModelViewSet):
    queryset = DamageHead.objects.select_related("customer", "vouchercode", "monthlist", "yearlist").prefetch_related("items__product").all()
    permission_classes = [AllowAny]
    pagination_class = None
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ["invoiceno", "customer__costname"]
    filterset_fields = ["customer", "monthlist", "yearlist"]

    def get_serializer_class(self):
        if self.action == "list":
            return DamageHeadListSerializer
        return DamageHeadSerializer


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


class PurchaseSummaryView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        date_from = request.query_params.get("date_from")
        date_to = request.query_params.get("date_to")

        qs = PurchaseItem.objects.select_related(
            "product__productgroup", "purchasehead"
        )
        if date_from:
            qs = qs.filter(purchasehead__invoicedate__gte=date_from)
        if date_to:
            qs = qs.filter(purchasehead__invoicedate__lte=date_to)

        rows = (
            qs.values(
                "purchasehead__invoicedate",
                "product__prodcode",
                "product__productname",
                "product__productgroup__groupname",
            )
            .annotate(total_qty=Sum("quantity"), total_amount=Sum("purprice"))
            .order_by(
                "purchasehead__invoicedate",
                "product__productgroup__groupname",
                "product__productname",
            )
        )

        result = [
            {
                "date": row["purchasehead__invoicedate"],
                "product_code": row["product__prodcode"],
                "product_name": row["product__productname"],
                "product_group": row["product__productgroup__groupname"],
                "total_qty": row["total_qty"],
                "total_amount": str(row["total_amount"]),
            }
            for row in rows
        ]
        return Response(result)


class SalesSummaryView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        date_from = request.query_params.get("date_from")
        date_to = request.query_params.get("date_to")

        qs = SalesItem.objects.select_related(
            "product__productgroup", "saleshead"
        )
        if date_from:
            qs = qs.filter(saleshead__invoicedate__gte=date_from)
        if date_to:
            qs = qs.filter(saleshead__invoicedate__lte=date_to)

        rows = (
            qs.values(
                "saleshead__invoicedate",
                "product__prodcode",
                "product__productname",
                "product__productgroup__groupname",
            )
            .annotate(total_qty=Sum("quantity"), total_amount=Sum("salesprice"))
            .order_by(
                "saleshead__invoicedate",
                "product__productgroup__groupname",
                "product__productname",
            )
        )

        result = [
            {
                "date": row["saleshead__invoicedate"],
                "product_code": row["product__prodcode"],
                "product_name": row["product__productname"],
                "product_group": row["product__productgroup__groupname"],
                "total_qty": row["total_qty"],
                "total_amount": str(row["total_amount"]),
            }
            for row in rows
        ]
        return Response(result)


class PurchaseSalesReportView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        from datetime import date as _date, timedelta
        from decimal import Decimal

        date_from_str = request.query_params.get("date_from")
        date_to_str = request.query_params.get("date_to")
        group_id = request.query_params.get("product_group")
        product_id = request.query_params.get("product")

        date_from = _date.fromisoformat(date_from_str) if date_from_str else None
        date_to = _date.fromisoformat(date_to_str) if date_to_str else None
        # Opening balance = stock at end of day before date_from
        opening_cutoff = (date_from - timedelta(days=1)) if date_from else None

        def apply_filter(pur_qs, sal_qs):
            if product_id:
                return pur_qs.filter(product_id=product_id), sal_qs.filter(product_id=product_id)
            if group_id:
                return pur_qs.filter(product__productgroup_id=group_id), sal_qs.filter(product__productgroup_id=group_id)
            return pur_qs, sal_qs

        # Daily totals IN the date range
        pur_in_qs, sal_in_qs = apply_filter(
            PurchaseItem.objects.select_related("purchasehead"),
            SalesItem.objects.select_related("saleshead"),
        )
        if date_from:
            pur_in_qs = pur_in_qs.filter(purchasehead__invoicedate__gte=date_from)
            sal_in_qs = sal_in_qs.filter(saleshead__invoicedate__gte=date_from)
        if date_to:
            pur_in_qs = pur_in_qs.filter(purchasehead__invoicedate__lte=date_to)
            sal_in_qs = sal_in_qs.filter(saleshead__invoicedate__lte=date_to)

        pur_by_date = {
            row["purchasehead__invoicedate"]: row["total"]
            for row in pur_in_qs.values("purchasehead__invoicedate").annotate(total=Sum("quantity"))
        }
        sal_by_date = {
            row["saleshead__invoicedate"]: row["total"]
            for row in sal_in_qs.values("saleshead__invoicedate").annotate(total=Sum("quantity"))
        }

        all_dates = sorted(set(pur_by_date) | set(sal_by_date))
        if not all_dates:
            return Response([])

        # Totals BEFORE the range (for opening balance)
        if opening_cutoff:
            pur_b_qs, sal_b_qs = apply_filter(
                PurchaseItem.objects.filter(purchasehead__invoicedate__lte=opening_cutoff),
                SalesItem.objects.filter(saleshead__invoicedate__lte=opening_cutoff),
            )
            pb = pur_b_qs.aggregate(t=Sum("quantity"))["t"] or Decimal("0")
            sb = sal_b_qs.aggregate(t=Sum("quantity"))["t"] or Decimal("0")
        else:
            pb = sb = Decimal("0")

        # Initial stock (openqty) for the selected scope
        if product_id:
            try:
                initial = Decimal(Product.objects.get(id=product_id).openqty)
            except Product.DoesNotExist:
                initial = Decimal("0")
        elif group_id:
            initial = Product.objects.filter(productgroup_id=group_id).aggregate(
                t=Sum("openqty"))["t"] or Decimal("0")
        else:
            initial = Decimal("0")

        # Build day-by-day ledger with running balance
        running = initial + pb - sb
        result = []
        for d in all_dates:
            pur = pur_by_date.get(d, Decimal("0"))
            sal = sal_by_date.get(d, Decimal("0"))
            closing = running + pur - sal
            result.append({
                "date": str(d),
                "opening_balance": str(running),
                "purchase_qty": str(pur),
                "sales_qty": str(sal),
                "closing_balance": str(closing),
            })
            running = closing

        return Response(result)
