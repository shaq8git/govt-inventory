from django.contrib.auth import authenticate, get_user_model

from rest_framework import serializers
from rest_framework.validators import UniqueValidator

from .models import Category, StockItem, Department, IssuanceRecord, IssuanceLine, UserRole, CircleOffice, DistrictOffice, Office, HeadOffice, Designation, ProductGroup, Mfccompany, Product, MonthCycle, Unit, MonthList, YearList, Status, VoucherCode, Supplier, PurchaseHead, PurchaseItem

User = get_user_model()


""" class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ["id", "name"] """

class UserRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserRole
        fields = ["id", "rolename"]

class UserSerializer(serializers.ModelSerializer):
    username = serializers.CharField(
        max_length=150,
        validators=[UniqueValidator(queryset=User.objects.all(), message="A user with that username already exists.")],
    )
    userrole = UserRoleSerializer(read_only=True)

    userrole_id = serializers.PrimaryKeyRelatedField(
        queryset=UserRole.objects.all(),
        source="userrole",
        write_only=True
        
    )

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "designation",
            "office_id",
            "districtoffice_id",
            "aprflag",
            "mobileno",
            "status_id",
            "otpdate",
            "lotpno",
            "is_active",
            "userrole",
            "userrole_id",

        ]


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    username = serializers.CharField(
        max_length=150,
        validators=[UniqueValidator(queryset=User.objects.all(), message="A user with that username already exists.")],
    )

    userrole = serializers.PrimaryKeyRelatedField(
        queryset=UserRole.objects.all(),
        required=False
    )

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "password",
            "first_name",
            "last_name",
            "designation",
            "office_id",
            "districtoffice_id",
            "aprflag",
            "mobileno",
            "status_id",
            "otpdate",
            "lotpno",
            "userrole",
        ]

    def create(self, validated_data):
        
        password = validated_data.pop("password")

        user = User.objects.create_user(password=password, **validated_data)
        
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = authenticate(
            request=self.context.get("request"),
            username=attrs["username"],
            password=attrs["password"],
        )
        if user is None:
            raise serializers.ValidationError("Invalid username or password.")
        if not user.is_active:
            raise serializers.ValidationError("This account is inactive.")
        attrs["user"] = user
        return attrs

class HeadOfficeSerializer(serializers.ModelSerializer):
    class Meta:
        model = HeadOffice
        fields = ["id", "officename", "address"]


class CircleOfficeSerializer(serializers.ModelSerializer):
    class Meta:
        model = CircleOffice
        fields = ["id", "circleofficename", "officeaddress", "headoffice_id", "slno"]


class DistrictOfficeSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source="districtofficename", read_only=True)

    class Meta:
        model = DistrictOffice
        fields = ["id", "name", "districtofficename", "officeaddress", "nomanp", "orderno"]


class OfficeSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source="officename", read_only=True)
    districtoffice_name = serializers.CharField(
        source="districtoffice.districtofficename", read_only=True, default=None
    )

    class Meta:
        model = Office
        fields = ["id", "name", "officename", "officeaddress", "districtoffice_id", "districtoffice_name", "activity", "orderno"]


class DesignationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Designation
        fields = ["id", "designationname", "class_field", "grade_id", "nopost", "desigslno", "officerornot_id"]


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


class StatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Status
        fields = ["id", "statusname"]


class MonthCycleSerializer(serializers.ModelSerializer):
    month_name = serializers.CharField(source="month.monthname", read_only=True, default=None)
    year_number = serializers.IntegerField(source="year.yearnumber", read_only=True, default=None)
    days = serializers.SerializerMethodField()

    class Meta:
        model = MonthCycle
        fields = [
            "id", "cyclename", "month", "month_name", "year", "year_number",
            "startdate", "enddate", "days", "slno",
        ]

    def get_days(self, obj):
        if obj.startdate and obj.enddate:
            return (obj.enddate - obj.startdate).days + 1
        return None


class UnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Unit
        fields = ["id", "unitname"]


class MonthListSerializer(serializers.ModelSerializer):
    class Meta:
        model = MonthList
        fields = ["id", "monthno", "monthname"]


class YearListSerializer(serializers.ModelSerializer):
    class Meta:
        model = YearList
        fields = ["id", "yearnumber"]


class ProductGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductGroup
        fields = ["id", "groupcode", "groupname", "slno"]
        read_only_fields = ["groupcode"]


class MfccompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Mfccompany
        fields = ["id", "companyname", "address", "contactno", "status_id"]


class ProductSerializer(serializers.ModelSerializer):
    productgroup_name = serializers.CharField(source="productgroup.groupname", read_only=True)
    mfccompany_name = serializers.CharField(source="mfccompany.companyname", read_only=True, default=None)
    status_name = serializers.CharField(source="status.statusname", read_only=True, default=None)

    class Meta:
        model = Product
        fields = [
            "id", "prodcode", "productname", "productgroup", "productgroup_name",
            "mfccompany", "mfccompany_name", "unit",
            "openqty", "openqtyyear_id", "currentqty", "currentqtyyear_id",
            "openflag", "purchaserate", "salesrate", "mrp", "status", "status_name",
        ]
        read_only_fields = ["prodcode"]


class VoucherCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = VoucherCode
        fields = ["id", "shortname", "description"]


class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = ["id", "supname", "contact", "address", "shipingadr", "created_at", "updated_at"]


class PurchaseItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.productname", read_only=True)
    product_code = serializers.IntegerField(source="product.prodcode", read_only=True)
    opnbalance = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    clbalance = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)

    class Meta:
        model = PurchaseItem
        fields = [
            "id", "product", "product_name", "product_code",
            "quantity", "opnbalance", "clbalance",
            "purrate", "purprice", "salesrate",
        ]

    def validate(self, attrs):
        product = attrs.get("product")
        if product:
            qty = attrs.get("quantity", 0)
            if "opnbalance" not in attrs:
                attrs["opnbalance"] = product.currentqty
            if "clbalance" not in attrs:
                attrs["clbalance"] = product.currentqty + qty
            if "purrate" not in attrs:
                attrs["purrate"] = product.purchaserate
            if "salesrate" not in attrs:
                attrs["salesrate"] = product.salesrate
        return attrs


class PurchaseItemCreateSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.productname", read_only=True)
    product_code = serializers.IntegerField(source="product.prodcode", read_only=True)

    class Meta:
        model = PurchaseItem
        fields = [
            "id", "purchasehead", "product", "product_name", "product_code",
            "quantity", "opnbalance", "clbalance",
            "purrate", "purprice", "salesrate",
        ]

    def validate(self, attrs):
        product = attrs.get("product")
        qty = attrs.get("quantity", 0)
        if product:
            attrs.setdefault("opnbalance", product.currentqty)
            attrs.setdefault("clbalance", product.currentqty + qty)
            attrs.setdefault("purrate", product.purchaserate)
            attrs.setdefault("salesrate", product.salesrate)
        purrate = attrs.get("purrate", 0)
        attrs["purprice"] = qty * purrate
        return attrs


class PurchaseHeadSerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(source="supplier.supname", read_only=True)
    vouchercode_short = serializers.CharField(source="vouchercode.shortname", read_only=True, default=None)
    month_name = serializers.CharField(source="monthlist.monthname", read_only=True, default=None)
    year_number = serializers.IntegerField(source="yearlist.yearnumber", read_only=True, default=None)
    items = PurchaseItemSerializer(many=True, required=False, default=[])
    invoiceno = serializers.CharField(read_only=True)

    class Meta:
        model = PurchaseHead
        fields = [
            "id", "invoiceno", "invoicedate", "remark",
            "supplier", "supplier_name",
            "vouchercode", "vouchercode_short",
            "monthlist", "month_name", "yearlist", "year_number",
            "created_at", "updated_at", "items",
        ]

    def create(self, validated_data):
        items_data = validated_data.pop("items")
        head = PurchaseHead.objects.create(**validated_data)
        for item_data in items_data:
            product = item_data.get("product")
            if product:
                qty = item_data.get("quantity", 0)
                item_data.setdefault("opnbalance", product.currentqty)
                item_data.setdefault("clbalance", product.currentqty + qty)
                item_data.setdefault("purrate", product.purchaserate)
                item_data.setdefault("salesrate", product.salesrate)
            PurchaseItem.objects.create(purchasehead=head, **item_data)
        return head

    def update(self, instance, validated_data):
        items_data = validated_data.pop("items", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if items_data is not None:
            instance.items.all().delete()
            for item_data in items_data:
                product = item_data.get("product")
                if product:
                    qty = item_data.get("quantity", 0)
                    item_data.setdefault("opnbalance", product.currentqty)
                    item_data.setdefault("clbalance", product.currentqty + qty)
                    item_data.setdefault("purrate", product.purchaserate)
                    item_data.setdefault("salesrate", product.salesrate)
                PurchaseItem.objects.create(purchasehead=instance, **item_data)
        return instance


class PurchaseHeadListSerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(source="supplier.supname", read_only=True)
    vouchercode_short = serializers.CharField(source="vouchercode.shortname", read_only=True, default=None)
    items_count = serializers.IntegerField(source="items.count", read_only=True)

    class Meta:
        model = PurchaseHead
        fields = [
            "id", "invoiceno", "invoicedate", "remark",
            "supplier", "supplier_name",
            "vouchercode", "vouchercode_short",
            "items_count", "created_at",
        ]
