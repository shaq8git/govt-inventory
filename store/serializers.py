from django.contrib.auth import authenticate, get_user_model

from rest_framework import serializers
from rest_framework.validators import UniqueValidator

from .models import Category, StockItem, Department, IssuanceRecord, IssuanceLine, UserRole, CircleOffice, DistrictOffice, Office, HeadOffice, Designation, ProductGroup, Mfccompany, Product, MonthCycle, Unit, MonthList, YearList, Status, VoucherCode, Supplier, PurchaseHead, PurchaseItem, Desk, PurRetHead, PurRetItem, Customer, SalesHead, SalesItem, SlRetHead, SlRetItem, ReplaceHead, ReplaceItem, TransferHead, TransferItem, DamageHead, DamageItem, RequisitionHead, RequisitionItem, BudgetHead, BudgetItem

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


class PurchaseReportSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.productname", read_only=True)
    product_code = serializers.CharField(source="product.prodcode", read_only=True)
    product_group = serializers.CharField(source="product.productgroup.groupname", read_only=True)
    invoiceno = serializers.CharField(source="purchasehead.invoiceno", read_only=True)
    invoicedate = serializers.DateField(source="purchasehead.invoicedate", read_only=True)
    supplier_name = serializers.CharField(source="purchasehead.supplier.supname", read_only=True)
    remark = serializers.CharField(source="purchasehead.remark", read_only=True, default="")

    class Meta:
        model = PurchaseItem
        fields = [
            "id", "invoiceno", "invoicedate", "supplier_name",
            "product", "product_name", "product_code", "product_group",
            "quantity", "purrate", "purprice", "salesrate", "remark",
        ]


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


class DeskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Desk
        fields = ["id", "deskname", "location"]


class PurRetItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.productname", read_only=True)
    product_code = serializers.IntegerField(source="product.prodcode", read_only=True)

    class Meta:
        model = PurRetItem
        fields = [
            "id", "product", "product_name", "product_code",
            "quantity", "opnbalance", "clbalance",
            "purrate", "purprice", "salesrate",
        ]

    def validate(self, attrs):
        product = attrs.get("product")
        qty = attrs.get("quantity", 0)
        if product:
            attrs.setdefault("opnbalance", product.currentqty)
            attrs.setdefault("clbalance", product.currentqty - qty)
            attrs.setdefault("purrate", product.purchaserate)
            attrs.setdefault("salesrate", product.salesrate)
        purrate = attrs.get("purrate", 0)
        attrs["purprice"] = qty * purrate
        return attrs


class PurRetItemCreateSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.productname", read_only=True)
    product_code = serializers.IntegerField(source="product.prodcode", read_only=True)

    class Meta:
        model = PurRetItem
        fields = [
            "id", "purrethead", "product", "product_name", "product_code",
            "quantity", "opnbalance", "clbalance",
            "purrate", "purprice", "salesrate",
        ]

    def validate(self, attrs):
        product = attrs.get("product")
        qty = attrs.get("quantity", 0)
        if product:
            attrs.setdefault("opnbalance", product.currentqty)
            attrs.setdefault("clbalance", product.currentqty - qty)
            attrs.setdefault("purrate", product.purchaserate)
            attrs.setdefault("salesrate", product.salesrate)
        purrate = attrs.get("purrate", 0)
        attrs["purprice"] = qty * purrate
        return attrs


class PurRetHeadSerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(source="supplier.supname", read_only=True)
    vouchercode_short = serializers.CharField(source="vouchercode.shortname", read_only=True, default=None)
    items = PurRetItemSerializer(many=True, required=False, default=[])
    invoiceno = serializers.CharField(read_only=True)

    class Meta:
        model = PurRetHead
        fields = [
            "id", "invoiceno", "purinvoiceno", "invoicedate", "remark",
            "supplier", "supplier_name",
            "vouchercode", "vouchercode_short",
            "monthlist", "yearlist",
            "created_at", "updated_at", "items",
        ]

    def create(self, validated_data):
        items_data = validated_data.pop("items")
        head = PurRetHead.objects.create(**validated_data)
        for item_data in items_data:
            product = item_data.get("product")
            if product:
                qty = item_data.get("quantity", 0)
                item_data.setdefault("opnbalance", product.currentqty)
                item_data.setdefault("clbalance", product.currentqty - qty)
                item_data.setdefault("purrate", product.purchaserate)
                item_data.setdefault("salesrate", product.salesrate)
            PurRetItem.objects.create(purrethead=head, **item_data)
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
                    item_data.setdefault("clbalance", product.currentqty - qty)
                    item_data.setdefault("purrate", product.purchaserate)
                    item_data.setdefault("salesrate", product.salesrate)
                PurRetItem.objects.create(purrethead=instance, **item_data)
        return instance


class PurRetHeadListSerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(source="supplier.supname", read_only=True)
    items_count = serializers.IntegerField(source="items.count", read_only=True)

    class Meta:
        model = PurRetHead
        fields = [
            "id", "invoiceno", "purinvoiceno", "invoicedate", "remark",
            "supplier", "supplier_name",
            "items_count", "created_at",
        ]


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


class CustomerSerializer(serializers.ModelSerializer):
    desk_name = serializers.CharField(source="desk.deskname", read_only=True, default=None)

    class Meta:
        model = Customer
        fields = ["id", "costname", "desk", "desk_name", "contact", "address", "shipingadr", "created_at", "updated_at"]


# ── Sales ─────────────────────────────────────────────────────────────────────

class SalesReportSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.productname", read_only=True)
    product_code = serializers.CharField(source="product.prodcode", read_only=True)
    product_group = serializers.CharField(source="product.productgroup.groupname", read_only=True)
    invoiceno = serializers.CharField(source="saleshead.invoiceno", read_only=True)
    invoicedate = serializers.DateField(source="saleshead.invoicedate", read_only=True)
    customer_name = serializers.CharField(source="saleshead.customer.costname", read_only=True)
    remark = serializers.CharField(source="saleshead.remark", read_only=True, default="")

    class Meta:
        model = SalesItem
        fields = [
            "id", "invoiceno", "invoicedate", "customer_name",
            "product", "product_name", "product_code", "product_group",
            "quantity", "salesrate", "salesprice", "remark",
        ]


class SalesItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.productname", read_only=True)
    product_code = serializers.IntegerField(source="product.prodcode", read_only=True)

    class Meta:
        model = SalesItem
        fields = ["id", "product", "product_name", "product_code", "quantity", "opnbalance", "clbalance", "purrate", "salesrate", "salesprice"]

    def validate(self, attrs):
        product = attrs.get("product")
        qty = attrs.get("quantity", 0)
        if product:
            attrs.setdefault("opnbalance", product.currentqty)
            attrs.setdefault("clbalance", product.currentqty - qty)
            attrs.setdefault("purrate", product.purchaserate)
            attrs.setdefault("salesrate", product.salesrate)
        salesrate = attrs.get("salesrate", 0)
        attrs["salesprice"] = qty * salesrate
        return attrs


class SalesItemCreateSerializer(SalesItemSerializer):
    class Meta(SalesItemSerializer.Meta):
        fields = ["id", "saleshead", "product", "product_name", "product_code", "quantity", "opnbalance", "clbalance", "purrate", "salesrate", "salesprice"]


class SalesHeadSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source="customer.costname", read_only=True)
    vouchercode_short = serializers.CharField(source="vouchercode.shortname", read_only=True, default=None)
    items = SalesItemSerializer(many=True, required=False, default=[])
    invoiceno = serializers.CharField(read_only=True)

    class Meta:
        model = SalesHead
        fields = ["id", "invoiceno", "invoicedate", "remark", "customer", "customer_name", "vouchercode", "vouchercode_short", "monthlist", "yearlist", "created_at", "updated_at", "items"]

    def _set_item_defaults(self, item_data):
        product = item_data.get("product")
        qty = item_data.get("quantity", 0)
        if product:
            item_data.setdefault("opnbalance", product.currentqty)
            item_data.setdefault("clbalance", product.currentqty - qty)
            item_data.setdefault("purrate", product.purchaserate)
            item_data.setdefault("salesrate", product.salesrate)
            item_data.setdefault("salesprice", qty * item_data.get("salesrate", product.salesrate))

    def create(self, validated_data):
        items_data = validated_data.pop("items")
        head = SalesHead.objects.create(**validated_data)
        for item_data in items_data:
            self._set_item_defaults(item_data)
            SalesItem.objects.create(saleshead=head, **item_data)
        return head

    def update(self, instance, validated_data):
        items_data = validated_data.pop("items", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if items_data is not None:
            instance.items.all().delete()
            for item_data in items_data:
                self._set_item_defaults(item_data)
                SalesItem.objects.create(saleshead=instance, **item_data)
        return instance


class SalesHeadListSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source="customer.costname", read_only=True)
    items_count = serializers.IntegerField(source="items.count", read_only=True)

    class Meta:
        model = SalesHead
        fields = ["id", "invoiceno", "invoicedate", "remark", "customer", "customer_name", "items_count", "created_at"]


# ── Sales Return ──────────────────────────────────────────────────────────────

class SlRetItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.productname", read_only=True)
    product_code = serializers.IntegerField(source="product.prodcode", read_only=True)

    class Meta:
        model = SlRetItem
        fields = ["id", "product", "product_name", "product_code", "quantity", "opnbalance", "clbalance", "purrate", "salesrate", "salesprice"]

    def validate(self, attrs):
        product = attrs.get("product")
        qty = attrs.get("quantity", 0)
        if product:
            attrs.setdefault("opnbalance", product.currentqty)
            attrs.setdefault("clbalance", product.currentqty + qty)
            attrs.setdefault("purrate", product.purchaserate)
            attrs.setdefault("salesrate", product.salesrate)
        salesrate = attrs.get("salesrate", 0)
        attrs["salesprice"] = qty * salesrate
        return attrs


class SlRetItemCreateSerializer(SlRetItemSerializer):
    class Meta(SlRetItemSerializer.Meta):
        fields = ["id", "slrethead", "product", "product_name", "product_code", "quantity", "opnbalance", "clbalance", "purrate", "salesrate", "salesprice"]


class SlRetHeadSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source="customer.costname", read_only=True)
    vouchercode_short = serializers.CharField(source="vouchercode.shortname", read_only=True, default=None)
    items = SlRetItemSerializer(many=True, required=False, default=[])
    invoiceno = serializers.CharField(read_only=True)

    class Meta:
        model = SlRetHead
        fields = ["id", "invoiceno", "saleinvoiceno", "invoicedate", "remark", "customer", "customer_name", "vouchercode", "vouchercode_short", "monthlist", "yearlist", "created_at", "updated_at", "items"]

    def _set_item_defaults(self, item_data):
        product = item_data.get("product")
        qty = item_data.get("quantity", 0)
        if product:
            item_data.setdefault("opnbalance", product.currentqty)
            item_data.setdefault("clbalance", product.currentqty + qty)
            item_data.setdefault("purrate", product.purchaserate)
            item_data.setdefault("salesrate", product.salesrate)
            item_data.setdefault("salesprice", qty * item_data.get("salesrate", product.salesrate))

    def create(self, validated_data):
        items_data = validated_data.pop("items")
        head = SlRetHead.objects.create(**validated_data)
        for item_data in items_data:
            self._set_item_defaults(item_data)
            SlRetItem.objects.create(slrethead=head, **item_data)
        return head

    def update(self, instance, validated_data):
        items_data = validated_data.pop("items", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if items_data is not None:
            instance.items.all().delete()
            for item_data in items_data:
                self._set_item_defaults(item_data)
                SlRetItem.objects.create(slrethead=instance, **item_data)
        return instance


class SlRetHeadListSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source="customer.costname", read_only=True)
    items_count = serializers.IntegerField(source="items.count", read_only=True)

    class Meta:
        model = SlRetHead
        fields = ["id", "invoiceno", "saleinvoiceno", "invoicedate", "remark", "customer", "customer_name", "items_count", "created_at"]


# ── Replace ───────────────────────────────────────────────────────────────────

class ReplaceItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.productname", read_only=True)
    product_code = serializers.IntegerField(source="product.prodcode", read_only=True)

    class Meta:
        model = ReplaceItem
        fields = ["id", "product", "product_name", "product_code", "quantity", "opnbalance", "clbalance", "purrate", "replacerate", "replaceprice"]

    def validate(self, attrs):
        product = attrs.get("product")
        qty = attrs.get("quantity", 0)
        if product:
            attrs.setdefault("opnbalance", product.currentqty)
            attrs.setdefault("clbalance", product.currentqty - qty)
            attrs.setdefault("purrate", product.purchaserate)
            attrs.setdefault("replacerate", product.salesrate)
        replacerate = attrs.get("replacerate", 0)
        attrs["replaceprice"] = qty * replacerate
        return attrs


class ReplaceItemCreateSerializer(ReplaceItemSerializer):
    class Meta(ReplaceItemSerializer.Meta):
        fields = ["id", "replacehead", "product", "product_name", "product_code", "quantity", "opnbalance", "clbalance", "purrate", "replacerate", "replaceprice"]


class ReplaceHeadSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source="customer.costname", read_only=True)
    vouchercode_short = serializers.CharField(source="vouchercode.shortname", read_only=True, default=None)
    items = ReplaceItemSerializer(many=True, required=False, default=[])
    invoiceno = serializers.CharField(read_only=True)

    class Meta:
        model = ReplaceHead
        fields = ["id", "invoiceno", "saleinvoiceno", "invoicedate", "remark", "customer", "customer_name", "vouchercode", "vouchercode_short", "monthlist", "yearlist", "created_at", "updated_at", "items"]

    def _set_item_defaults(self, item_data):
        product = item_data.get("product")
        qty = item_data.get("quantity", 0)
        if product:
            item_data.setdefault("opnbalance", product.currentqty)
            item_data.setdefault("clbalance", product.currentqty - qty)
            item_data.setdefault("purrate", product.purchaserate)
            item_data.setdefault("replacerate", product.salesrate)
            item_data.setdefault("replaceprice", qty * item_data.get("replacerate", product.salesrate))

    def create(self, validated_data):
        items_data = validated_data.pop("items")
        head = ReplaceHead.objects.create(**validated_data)
        for item_data in items_data:
            self._set_item_defaults(item_data)
            ReplaceItem.objects.create(replacehead=head, **item_data)
        return head

    def update(self, instance, validated_data):
        items_data = validated_data.pop("items", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if items_data is not None:
            instance.items.all().delete()
            for item_data in items_data:
                self._set_item_defaults(item_data)
                ReplaceItem.objects.create(replacehead=instance, **item_data)
        return instance


class ReplaceHeadListSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source="customer.costname", read_only=True)
    items_count = serializers.IntegerField(source="items.count", read_only=True)

    class Meta:
        model = ReplaceHead
        fields = ["id", "invoiceno", "saleinvoiceno", "invoicedate", "remark", "customer", "customer_name", "items_count", "created_at"]


# ── Transfer ──────────────────────────────────────────────────────────────────

class TransferItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.productname", read_only=True)
    product_code = serializers.IntegerField(source="product.prodcode", read_only=True)

    class Meta:
        model = TransferItem
        fields = ["id", "product", "product_name", "product_code", "quantity", "opnbalance", "clbalance", "purrate", "transrate", "transprice"]

    def validate(self, attrs):
        product = attrs.get("product")
        qty = attrs.get("quantity", 0)
        if product:
            attrs.setdefault("opnbalance", product.currentqty)
            attrs.setdefault("clbalance", product.currentqty)
            attrs.setdefault("purrate", product.purchaserate)
            attrs.setdefault("transrate", product.salesrate)
        transrate = attrs.get("transrate", 0)
        attrs["transprice"] = qty * transrate
        return attrs


class TransferItemCreateSerializer(TransferItemSerializer):
    class Meta(TransferItemSerializer.Meta):
        fields = ["id", "transferhead", "product", "product_name", "product_code", "quantity", "opnbalance", "clbalance", "purrate", "transrate", "transprice"]


class TransferHeadSerializer(serializers.ModelSerializer):
    fromcustomer_name = serializers.CharField(source="fromcustomer.costname", read_only=True)
    tocustomer_name = serializers.CharField(source="tocustomer.costname", read_only=True)
    vouchercode_short = serializers.CharField(source="vouchercode.shortname", read_only=True, default=None)
    items = TransferItemSerializer(many=True, required=False, default=[])
    invoiceno = serializers.CharField(read_only=True)

    class Meta:
        model = TransferHead
        fields = ["id", "invoiceno", "invoicedate", "remark", "fromcustomer", "fromcustomer_name", "tocustomer", "tocustomer_name", "vouchercode", "vouchercode_short", "monthlist", "yearlist", "created_at", "updated_at", "items"]

    def _set_item_defaults(self, item_data):
        product = item_data.get("product")
        qty = item_data.get("quantity", 0)
        if product:
            item_data.setdefault("opnbalance", product.currentqty)
            item_data.setdefault("clbalance", product.currentqty)
            item_data.setdefault("purrate", product.purchaserate)
            item_data.setdefault("transrate", product.salesrate)
            item_data.setdefault("transprice", qty * item_data.get("transrate", product.salesrate))

    def create(self, validated_data):
        items_data = validated_data.pop("items")
        head = TransferHead.objects.create(**validated_data)
        for item_data in items_data:
            self._set_item_defaults(item_data)
            TransferItem.objects.create(transferhead=head, **item_data)
        return head

    def update(self, instance, validated_data):
        items_data = validated_data.pop("items", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if items_data is not None:
            instance.items.all().delete()
            for item_data in items_data:
                self._set_item_defaults(item_data)
                TransferItem.objects.create(transferhead=instance, **item_data)
        return instance


class TransferHeadListSerializer(serializers.ModelSerializer):
    fromcustomer_name = serializers.CharField(source="fromcustomer.costname", read_only=True)
    tocustomer_name = serializers.CharField(source="tocustomer.costname", read_only=True)
    items_count = serializers.IntegerField(source="items.count", read_only=True)

    class Meta:
        model = TransferHead
        fields = ["id", "invoiceno", "invoicedate", "remark", "fromcustomer", "fromcustomer_name", "tocustomer", "tocustomer_name", "items_count", "created_at"]


# ── Damage ────────────────────────────────────────────────────────────────────

class DamageItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.productname", read_only=True)
    product_code = serializers.IntegerField(source="product.prodcode", read_only=True)

    class Meta:
        model = DamageItem
        fields = [
            "id", "damagehead", "product", "product_name", "product_code",
            "quantity", "opnbalance", "clbalance",
            "purrate", "damagerate", "damageprice",
        ]


class DamageItemCreateSerializer(DamageItemSerializer):
    class Meta(DamageItemSerializer.Meta):
        fields = [
            "id", "damagehead", "product", "product_name", "product_code",
            "quantity", "opnbalance", "clbalance",
            "purrate", "damagerate", "damageprice",
        ]


class DamageHeadSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source="customer.costname", read_only=True)
    vouchercode_short = serializers.CharField(source="vouchercode.shortname", read_only=True, default=None)
    items = DamageItemSerializer(many=True, required=False, default=[])
    invoiceno = serializers.CharField(read_only=True)

    class Meta:
        model = DamageHead
        fields = [
            "id", "invoiceno", "invoicedate", "remark",
            "customer", "customer_name",
            "vouchercode", "vouchercode_short",
            "monthlist", "yearlist",
            "created_at", "updated_at", "items",
        ]

    def _set_item_defaults(self, item_data):
        product = item_data.get("product")
        qty = item_data.get("quantity", 0)
        if product:
            item_data.setdefault("opnbalance", product.currentqty)
            item_data.setdefault("clbalance", product.currentqty - qty)
            item_data.setdefault("purrate", product.purchaserate)
            item_data.setdefault("damagerate", product.salesrate)
            item_data.setdefault("damageprice", qty * item_data.get("damagerate", product.salesrate))

    def create(self, validated_data):
        items_data = validated_data.pop("items")
        head = DamageHead.objects.create(**validated_data)
        for item_data in items_data:
            self._set_item_defaults(item_data)
            DamageItem.objects.create(damagehead=head, **item_data)
        return head

    def update(self, instance, validated_data):
        items_data = validated_data.pop("items", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if items_data is not None:
            instance.items.all().delete()
            for item_data in items_data:
                self._set_item_defaults(item_data)
                DamageItem.objects.create(damagehead=instance, **item_data)
        return instance


class DamageHeadListSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source="customer.costname", read_only=True)
    items_count = serializers.IntegerField(source="items.count", read_only=True)

    class Meta:
        model = DamageHead
        fields = [
            "id", "invoiceno", "invoicedate", "remark",
            "customer", "customer_name",
            "items_count", "created_at",
        ]


# ── Requisition ───────────────────────────────────────────────────────────────

class RequisitionItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.productname", read_only=True)
    product_code = serializers.IntegerField(source="product.prodcode", read_only=True)

    class Meta:
        model = RequisitionItem
        fields = [
            "id", "product", "product_name", "product_code",
            "primquantity", "reqquantity",
            "requserinfo_id", "approveuserinfo_id", "approvflag", "approvdate",
        ]


class RequisitionItemCreateSerializer(RequisitionItemSerializer):
    class Meta(RequisitionItemSerializer.Meta):
        fields = ["id", "requisitionhead"] + RequisitionItemSerializer.Meta.fields[1:]


class RequisitionHeadSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source="customer.costname", read_only=True)
    vouchercode_short = serializers.CharField(source="vouchercode.shortname", read_only=True, default=None)
    items = RequisitionItemSerializer(many=True, required=False, default=[])
    requisitionno = serializers.CharField(read_only=True)

    class Meta:
        model = RequisitionHead
        fields = [
            "id", "requisitionno", "requisitiondate", "remark",
            "customer", "customer_name",
            "vouchercode", "vouchercode_short",
            "monthlist", "yearlist",
            "cruser_id", "upduser_id",
            "created_at", "updated_at", "items",
        ]

    def create(self, validated_data):
        items_data = validated_data.pop("items", [])
        # Auto-assign RQ vouchercode if not provided
        if not validated_data.get("vouchercode"):
            from .models import VoucherCode as _VC
            rq, _ = _VC.objects.get_or_create(shortname="RQ", defaults={"description": "Requisition"})
            validated_data["vouchercode"] = rq
        head = RequisitionHead.objects.create(**validated_data)
        for item_data in items_data:
            RequisitionItem.objects.create(requisitionhead=head, **item_data)
        return head

    def update(self, instance, validated_data):
        items_data = validated_data.pop("items", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if items_data is not None:
            instance.items.all().delete()
            for item_data in items_data:
                RequisitionItem.objects.create(requisitionhead=instance, **item_data)
        return instance


class RequisitionHeadListSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source="customer.costname", read_only=True)
    items_count = serializers.IntegerField(source="items.count", read_only=True)
    cruser_name = serializers.SerializerMethodField()

    def get_cruser_name(self, obj):
        if obj.cruser_id:
            try:
                u = User.objects.get(pk=obj.cruser_id)
                return u.get_full_name() or u.username
            except User.DoesNotExist:
                return f"User #{obj.cruser_id}"
        return ""

    class Meta:
        model = RequisitionHead
        fields = [
            "id", "requisitionno", "requisitiondate", "remark",
            "customer", "customer_name",
            "cruser_id", "cruser_name", "upduser_id",
            "items_count", "created_at",
        ]


# ── Budget ────────────────────────────────────────────────────────────────────

class BudgetItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.productname", read_only=True)
    product_code = serializers.IntegerField(source="product.prodcode", read_only=True)

    class Meta:
        model = BudgetItem
        fields = [
            "id", "product", "product_name", "product_code",
            "primquantity", "primpurrate",
            "bdgquantity", "bdgpurrate",
            "bdguserinfo_id", "approveuserinfo_id", "approvflag", "approvdate",
        ]


class BudgetItemCreateSerializer(BudgetItemSerializer):
    class Meta(BudgetItemSerializer.Meta):
        fields = ["id", "budgethead"] + BudgetItemSerializer.Meta.fields[1:]


class BudgetHeadSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source="customer.costname", read_only=True)
    vouchercode_short = serializers.CharField(source="vouchercode.shortname", read_only=True, default=None)
    items = BudgetItemSerializer(many=True, required=False, default=[])
    budgetno = serializers.CharField(read_only=True)

    class Meta:
        model = BudgetHead
        fields = [
            "id", "budgetno", "budgetdate", "remark",
            "customer", "customer_name",
            "vouchercode", "vouchercode_short",
            "monthlist", "yearlist",
            "created_at", "updated_at", "items",
        ]

    def create(self, validated_data):
        items_data = validated_data.pop("items", [])
        head = BudgetHead.objects.create(**validated_data)
        for item_data in items_data:
            BudgetItem.objects.create(budgethead=head, **item_data)
        return head

    def update(self, instance, validated_data):
        items_data = validated_data.pop("items", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if items_data is not None:
            instance.items.all().delete()
            for item_data in items_data:
                BudgetItem.objects.create(budgethead=instance, **item_data)
        return instance


class BudgetHeadListSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source="customer.costname", read_only=True)
    items_count = serializers.IntegerField(source="items.count", read_only=True)

    class Meta:
        model = BudgetHead
        fields = [
            "id", "budgetno", "budgetdate", "remark",
            "customer", "customer_name", "items_count", "created_at",
        ]


class ApprovedRequisitionSerializer(serializers.ModelSerializer):
    requisitionno = serializers.CharField(source="requisitionhead.requisitionno", read_only=True)
    requisitiondate = serializers.DateField(source="requisitionhead.requisitiondate", read_only=True)
    customer_name = serializers.CharField(source="requisitionhead.customer.costname", read_only=True)
    product_name = serializers.CharField(source="product.productname", read_only=True)
    product_code = serializers.SerializerMethodField()
    product_group = serializers.CharField(source="product.productgroup.groupname", read_only=True)

    def get_product_code(self, obj):
        return f"{obj.product.productgroup.groupcode}{obj.product.prodcode}"

    class Meta:
        model = RequisitionItem
        fields = [
            "id", "requisitionno", "requisitiondate", "customer_name",
            "product", "product_code", "product_name", "product_group",
            "primquantity", "reqquantity", "approvflag", "approvdate",
        ]
