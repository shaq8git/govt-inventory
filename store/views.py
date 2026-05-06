from django.contrib.auth import get_user_model
from rest_framework import viewsets, filters, status
from rest_framework.authtoken.models import Token
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum, Count
from .models import Category, StockItem, Department, IssuanceRecord, IssuanceLine, UserRole, CircleOffice, DistrictOffice, Office, HeadOffice, Designation, ProductGroup, Mfccompany, Product, MonthCycle, Unit, MonthList, YearList, Status
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
