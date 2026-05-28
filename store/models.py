from django.contrib.auth.models import AbstractUser
from django.db import models


class HeadOffice(models.Model):
    officename = models.CharField(max_length=200)
    address = models.CharField(max_length=300, blank=True, null=True)

    class Meta:
        db_table = "headoffice"

    def __str__(self):
        return self.officename


class UserRole(models.Model):
    rolename = models.CharField(max_length=250)

    def __str__(self):
        return self.rolename


class Division(models.Model):
    divcode = models.CharField(max_length=3)
    divisionname = models.CharField(max_length=100)

    class Meta:
        db_table = "division"
        ordering = ["id"]

    def __str__(self):
        return self.divisionname


class District(models.Model):
    division = models.ForeignKey(Division, on_delete=models.PROTECT, related_name="districts")
    districtname = models.CharField(max_length=100)

    class Meta:
        db_table = "district"
        ordering = ["districtname"]

    def __str__(self):
        return self.districtname


class CircleOffice(models.Model):
    circleofficename = models.CharField(max_length=100)
    officeaddress = models.CharField(max_length=250, blank=True, null=True)
    headoffice_id = models.IntegerField(default=0)
    slno = models.IntegerField(default=0)

    class Meta:
        db_table = "circleoffice"
        ordering = ["slno"]

    def __str__(self):
        return self.circleofficename


class DistrictOffice(models.Model):
    circleoffice = models.ForeignKey(
        CircleOffice, on_delete=models.PROTECT,
        related_name="district_offices", null=True, blank=True
    )
    districtofficename = models.CharField(max_length=100, default="")
    officeaddress = models.CharField(max_length=200, blank=True, null=True)
    nomanp = models.IntegerField(default=0)
    orderno = models.IntegerField(default=0)

    class Meta:
        ordering = ["orderno", "districtofficename"]

    def __str__(self):
        return self.districtofficename


class Office(models.Model):
    districtoffice = models.ForeignKey(
        DistrictOffice, on_delete=models.PROTECT,
        related_name="offices", null=True, blank=True
    )
    officename = models.CharField(max_length=100, blank=True, null=True)
    officeaddress = models.CharField(max_length=200, blank=True, null=True)
    activity = models.IntegerField(default=0)
    orderno = models.IntegerField(default=0)

    class Meta:
        ordering = ["orderno", "officename"]

    def __str__(self):
        return self.officename or ""


class Upazila(models.Model):
    district = models.ForeignKey(
        District, on_delete=models.PROTECT,
        related_name="upazilas", null=True, blank=True
    )
    division = models.ForeignKey(
        Division, on_delete=models.PROTECT,
        related_name="upazilas", null=True, blank=True
    )
    upazilaname = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        db_table = "upazila"
        ordering = ["upazilaname"]

    def __str__(self):
        return self.upazilaname or ""


class Designation(models.Model):
    designationname = models.CharField(max_length=100)
    class_field = models.CharField(max_length=50, db_column="class", default="0", blank=True)
    grade_id = models.IntegerField(default=0)
    nopost = models.IntegerField(default=0)
    desigslno = models.IntegerField(default=0)
    officerornot_id = models.IntegerField(default=0)

    class Meta:
        db_table = "designation"
        ordering = ["desigslno"]

    def __str__(self):
        return self.designationname


class User(AbstractUser):
    email = models.EmailField(unique=True)
    designation = models.CharField(max_length=200, blank=True)
    office_id = models.PositiveIntegerField(default=0)
    districtoffice_id = models.PositiveIntegerField(default=0)
    aprflag = models.PositiveSmallIntegerField(default=0)
    mobileno = models.CharField(max_length=25, blank=True)
    status_id = models.PositiveSmallIntegerField(default=1)
    otpdate = models.DateField(null=True, blank=True)
    lotpno = models.DateField(null=True, blank=True)
    userrole = models.ForeignKey(
        UserRole,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    REQUIRED_FIELDS = ["email"]

    class Meta:
        ordering = ["username"]


class MonthCycle(models.Model):
    cyclename = models.CharField(max_length=200)
    month = models.ForeignKey(
        "MonthList", on_delete=models.PROTECT, related_name="cycles", null=True, blank=True
    )
    year = models.ForeignKey(
        "YearList", on_delete=models.PROTECT, related_name="cycles", null=True, blank=True
    )
    startdate = models.DateField(null=True, blank=True)
    enddate = models.DateField(null=True, blank=True)
    slno = models.IntegerField(default=0)

    class Meta:
        db_table = "monthcycle"
        ordering = ["slno", "cyclename"]

    def __str__(self):
        return self.cyclename


class Status(models.Model):
    statusname = models.CharField(max_length=100, unique=True)

    class Meta:
        db_table = "status"
        ordering = ["id"]

    def __str__(self):
        return self.statusname


class Unit(models.Model):
    unitname = models.CharField(max_length=100, unique=True)

    class Meta:
        db_table = "unit"
        ordering = ["unitname"]

    def __str__(self):
        return self.unitname


class MonthList(models.Model):
    monthno = models.IntegerField(unique=True)
    monthname = models.CharField(max_length=20)

    class Meta:
        db_table = "monthlist"
        ordering = ["monthno"]

    def __str__(self):
        return self.monthname


class YearList(models.Model):
    yearnumber = models.IntegerField(unique=True)

    class Meta:
        db_table = "yearlist"
        ordering = ["yearnumber"]

    def __str__(self):
        return str(self.yearnumber)


class ProductGroup(models.Model):
    groupcode = models.IntegerField(unique=True)
    groupname = models.CharField(max_length=200)
    slno = models.IntegerField(default=0)

    class Meta:
        db_table = "productgroup"
        ordering = ["slno", "groupname"]

    def save(self, *args, **kwargs):
        if not self.pk and not self.groupcode:
            last = ProductGroup.objects.order_by("-groupcode").first()
            self.groupcode = (last.groupcode + 1) if last else 100
        super().save(*args, **kwargs)

    def __str__(self):
        return self.groupname


class Mfccompany(models.Model):
    companyname = models.CharField(max_length=200)
    address = models.CharField(max_length=300, blank=True, null=True)
    contactno = models.CharField(max_length=50, blank=True, null=True)
    status_id = models.SmallIntegerField(default=1)

    class Meta:
        db_table = "mfccompany"
        ordering = ["companyname"]

    def __str__(self):
        return self.companyname


class Product(models.Model):
    prodcode = models.IntegerField(unique=True)
    productname = models.CharField(max_length=300)
    productgroup = models.ForeignKey(
        ProductGroup, on_delete=models.PROTECT, related_name="products"
    )
    mfccompany = models.ForeignKey(
        Mfccompany, on_delete=models.PROTECT, related_name="products", null=True, blank=True
    )
    unit = models.CharField(max_length=50, blank=True, null=True)
    openqty = models.IntegerField(default=0)
    openqtyyear_id = models.IntegerField(default=0)
    currentqty = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    currentqtyyear_id = models.IntegerField(default=0)
    openflag = models.SmallIntegerField(default=0)
    purchaserate = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    salesrate = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    salesdiscountrate = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    mrp = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status = models.ForeignKey(
        Status, on_delete=models.PROTECT, related_name="products", null=True, blank=True
    )

    class Meta:
        db_table = "product"
        ordering = ["productname"]

    def save(self, *args, **kwargs):
        if not self.pk and not self.prodcode:
            group_prefix = self.productgroup.groupcode
            last = (
                Product.objects.filter(productgroup=self.productgroup)
                .order_by("-prodcode")
                .first()
            )
            if last:
                self.prodcode = last.prodcode + 1
            else:
                self.prodcode = int(f"{group_prefix}1001")
        super().save(*args, **kwargs)

    def __str__(self):
        return self.productname


class Category(models.Model):
    name = models.CharField(max_length=200, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ["name"]

    def __str__(self):
        return self.name


class StockItem(models.Model):
    UNIT_CHOICES = [
        ("ream", "Ream"),
        ("piece", "Piece"),
        ("box", "Box"),
        ("roll", "Roll"),
        ("set", "Set"),
        ("kg", "Kg"),
        ("litre", "Litre"),
        ("packet", "Packet"),
        ("other", "Other"),
    ]

    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name="items")
    item_number = models.PositiveSmallIntegerField(unique=True, help_text="Serial number from the register (1–118)")
    name = models.CharField(max_length=300)
    unit = models.CharField(max_length=20, choices=UNIT_CHOICES, default="piece")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["item_number"]

    def __str__(self):
        return f"[{self.item_number}] {self.name} ({self.unit})"


class Department(models.Model):
    name = models.CharField(max_length=200, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


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
        ordering = ["-date", "serial_number"]
        constraints = [
            models.UniqueConstraint(
                fields=["serial_number", "date", "department", "fiscal_year", "sheet_number"],
                name="unique_issuance_register_entry",
            )
        ]

    def __str__(self):
        return f"#{self.serial_number} | {self.date} | {self.department}"


class IssuanceLine(models.Model):
    record = models.ForeignKey(IssuanceRecord, on_delete=models.CASCADE, related_name="lines")
    item = models.ForeignKey(StockItem, on_delete=models.PROTECT, related_name="issuance_lines")
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["item__item_number"]
        unique_together = [("record", "item")]

    def __str__(self):
        return f"{self.record} → {self.item.name} × {self.quantity}"


class VoucherCode(models.Model):
    shortname = models.CharField(max_length=5, blank=True, null=True)
    description = models.CharField(max_length=25, blank=True, null=True)

    class Meta:
        db_table = "vouchercode"
        ordering = ["shortname"]

    def __str__(self):
        return f"{self.shortname} - {self.description or ''}"


class Supplier(models.Model):
    supname = models.CharField(max_length=50, blank=True, null=True)
    contact = models.CharField(max_length=50, blank=True, null=True)
    address = models.CharField(max_length=150, blank=True, null=True)
    shipingadr = models.CharField(max_length=200, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "supplier"
        ordering = ["supname"]

    def __str__(self):
        return self.supname or ""


class PurchaseHead(models.Model):
    supplier = models.ForeignKey(
        Supplier, on_delete=models.PROTECT, related_name="purchase_heads"
    )
    vouchercode = models.ForeignKey(
        VoucherCode, on_delete=models.PROTECT, related_name="purchase_heads",
        null=True, blank=True
    )
    invoiceno = models.CharField(max_length=20, blank=True)
    invoicedate = models.DateField(null=True, blank=True)
    remark = models.CharField(max_length=200, blank=True, null=True)
    monthlist = models.ForeignKey(
        MonthList, on_delete=models.PROTECT, related_name="purchase_heads",
        null=True, blank=True
    )
    yearlist = models.ForeignKey(
        YearList, on_delete=models.PROTECT, related_name="purchase_heads",
        null=True, blank=True
    )
    cruser_id = models.IntegerField(default=0)
    upduser_id = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "purchasehead"
        ordering = ["-invoicedate", "invoiceno"]

    def save(self, *args, **kwargs):
        if not self.pk and not self.invoiceno:
            from datetime import date as _date
            ref = self.invoicedate if self.invoicedate else _date.today()
            prefix = ref.strftime("%Y%m%d")
            last = (
                PurchaseHead.objects
                .filter(invoiceno__startswith=prefix)
                .order_by("-invoiceno")
                .first()
            )
            seq = 1
            if last:
                try:
                    seq = int(last.invoiceno[8:]) + 1
                except (ValueError, IndexError):
                    seq = 1
            self.invoiceno = f"{prefix}{seq:03d}"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.invoiceno


class PurchaseItem(models.Model):
    purchasehead = models.ForeignKey(
        PurchaseHead, on_delete=models.CASCADE, related_name="items"
    )
    product = models.ForeignKey(
        Product, on_delete=models.PROTECT, related_name="purchase_items"
    )
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    opnbalance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    clbalance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    purrate = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    purprice = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    salesrate = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    cruser_id = models.IntegerField(default=0)
    upduser_id = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "purchaseitem"
        ordering = ["product__productname"]

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        if is_new:
            Product.objects.filter(pk=self.product_id).update(
                currentqty=models.F("currentqty") + self.quantity
            )

    def delete(self, *args, **kwargs):
        Product.objects.filter(pk=self.product_id).update(
            currentqty=models.F("currentqty") - self.quantity
        )
        super().delete(*args, **kwargs)

    def __str__(self):
        return f"{self.purchasehead.invoiceno} — {self.product.productname}"


class Desk(models.Model):
    deskname = models.CharField(max_length=50, blank=True, null=True)
    location = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        db_table = "desk"
        ordering = ["deskname"]

    def __str__(self):
        return self.deskname or ""


class PurRetHead(models.Model):
    supplier = models.ForeignKey(
        Supplier, on_delete=models.PROTECT, related_name="purret_heads"
    )
    vouchercode = models.ForeignKey(
        VoucherCode, on_delete=models.PROTECT, related_name="purret_heads",
        null=True, blank=True
    )
    invoiceno = models.CharField(max_length=20, blank=True)
    purinvoiceno = models.CharField(max_length=20, blank=True, null=True)
    invoicedate = models.DateField(null=True, blank=True)
    remark = models.CharField(max_length=200, blank=True, null=True)
    monthlist = models.ForeignKey(
        MonthList, on_delete=models.PROTECT, related_name="purret_heads",
        null=True, blank=True
    )
    yearlist = models.ForeignKey(
        YearList, on_delete=models.PROTECT, related_name="purret_heads",
        null=True, blank=True
    )
    cruser_id = models.IntegerField(default=0)
    upduser_id = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "purrethead"
        ordering = ["-invoicedate", "invoiceno"]

    def save(self, *args, **kwargs):
        if not self.pk and not self.invoiceno:
            from datetime import date as _date
            ref = self.invoicedate if self.invoicedate else _date.today()
            prefix = ref.strftime("%Y%m%d")
            last = (
                PurRetHead.objects
                .filter(invoiceno__startswith=prefix)
                .order_by("-invoiceno")
                .first()
            )
            seq = 1
            if last:
                try:
                    seq = int(last.invoiceno[8:]) + 1
                except (ValueError, IndexError):
                    seq = 1
            self.invoiceno = f"{prefix}{seq:03d}"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.invoiceno


class PurRetItem(models.Model):
    purrethead = models.ForeignKey(
        PurRetHead, on_delete=models.CASCADE, related_name="items"
    )
    product = models.ForeignKey(
        Product, on_delete=models.PROTECT, related_name="purret_items"
    )
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    opnbalance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    clbalance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    purrate = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    purprice = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    salesrate = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    cruser_id = models.IntegerField(default=0)
    upduser_id = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "purretitem"
        ordering = ["product__productname"]

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        if is_new:
            Product.objects.filter(pk=self.product_id).update(
                currentqty=models.F("currentqty") - self.quantity
            )

    def delete(self, *args, **kwargs):
        Product.objects.filter(pk=self.product_id).update(
            currentqty=models.F("currentqty") + self.quantity
        )
        super().delete(*args, **kwargs)

    def __str__(self):
        return f"{self.purrethead.invoiceno} — {self.product.productname}"


class Customer(models.Model):
    costname = models.CharField(max_length=50, blank=True, null=True)
    desk = models.ForeignKey(
        Desk, on_delete=models.PROTECT, related_name="customers",
        null=True, blank=True
    )
    contact = models.CharField(max_length=50, blank=True, null=True)
    address = models.CharField(max_length=150, blank=True, null=True)
    shipingadr = models.CharField(max_length=250, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "customer"
        ordering = ["costname"]

    def __str__(self):
        return self.costname or ""


def _auto_invoiceno(model_class, prefix):
    from datetime import date as _date
    today = _date.today()
    full_prefix = f"{prefix}-{today.strftime('%Y%m%d')}-"
    last = (
        model_class.objects.filter(invoiceno__startswith=full_prefix)
        .order_by("-invoiceno").first()
    )
    seq = 1
    if last:
        try:
            seq = int(last.invoiceno.split("-")[-1]) + 1
        except ValueError:
            seq = 1
    return f"{full_prefix}{seq:03d}"


class SalesHead(models.Model):
    customer = models.ForeignKey(
        Customer, on_delete=models.PROTECT, related_name="sales_heads"
    )
    vouchercode = models.ForeignKey(
        VoucherCode, on_delete=models.PROTECT, related_name="sales_heads",
        null=True, blank=True
    )
    invoiceno = models.CharField(max_length=20, blank=True)
    invoicedate = models.DateField(null=True, blank=True)
    remark = models.CharField(max_length=200, blank=True, null=True)
    monthlist = models.ForeignKey(
        MonthList, on_delete=models.PROTECT, related_name="sales_heads",
        null=True, blank=True
    )
    yearlist = models.ForeignKey(
        YearList, on_delete=models.PROTECT, related_name="sales_heads",
        null=True, blank=True
    )
    cruser_id = models.IntegerField(default=0)
    upduser_id = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "saleshead"
        ordering = ["-invoicedate", "invoiceno"]

    def save(self, *args, **kwargs):
        if not self.pk and not self.invoiceno:
            from datetime import date as _date
            ref = self.invoicedate if self.invoicedate else _date.today()
            prefix = ref.strftime("%Y%m%d")
            last = (
                SalesHead.objects
                .filter(invoiceno__startswith=prefix)
                .order_by("-invoiceno")
                .first()
            )
            seq = 1
            if last:
                try:
                    seq = int(last.invoiceno[8:]) + 1
                except (ValueError, IndexError):
                    seq = 1
            self.invoiceno = f"{prefix}{seq:03d}"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.invoiceno


class SalesItem(models.Model):
    saleshead = models.ForeignKey(
        SalesHead, on_delete=models.CASCADE, related_name="items"
    )
    product = models.ForeignKey(
        Product, on_delete=models.PROTECT, related_name="sales_items"
    )
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    opnbalance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    clbalance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    purrate = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    salesrate = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    salesprice = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    cruser_id = models.IntegerField(default=0)
    upduser_id = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "salesitem"
        ordering = ["product__productname"]

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        if is_new:
            Product.objects.filter(pk=self.product_id).update(
                currentqty=models.F("currentqty") - self.quantity
            )

    def delete(self, *args, **kwargs):
        Product.objects.filter(pk=self.product_id).update(
            currentqty=models.F("currentqty") + self.quantity
        )
        super().delete(*args, **kwargs)

    def __str__(self):
        return f"{self.saleshead.invoiceno} — {self.product.productname}"


class SlRetHead(models.Model):
    customer = models.ForeignKey(
        Customer, on_delete=models.PROTECT, related_name="slret_heads"
    )
    vouchercode = models.ForeignKey(
        VoucherCode, on_delete=models.PROTECT, related_name="slret_heads",
        null=True, blank=True
    )
    invoiceno = models.CharField(max_length=20, blank=True)
    saleinvoiceno = models.CharField(max_length=20, blank=True, null=True)
    invoicedate = models.DateField(null=True, blank=True)
    remark = models.CharField(max_length=200, blank=True, null=True)
    monthlist = models.ForeignKey(
        MonthList, on_delete=models.PROTECT, related_name="slret_heads",
        null=True, blank=True
    )
    yearlist = models.ForeignKey(
        YearList, on_delete=models.PROTECT, related_name="slret_heads",
        null=True, blank=True
    )
    cruser_id = models.IntegerField(default=0)
    upduser_id = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "slrethead"
        ordering = ["-invoicedate", "invoiceno"]

    def save(self, *args, **kwargs):
        if not self.pk and not self.invoiceno:
            from datetime import date as _date
            ref = self.invoicedate if self.invoicedate else _date.today()
            prefix = ref.strftime("%Y%m%d")
            last = (
                SlRetHead.objects
                .filter(invoiceno__startswith=prefix)
                .order_by("-invoiceno")
                .first()
            )
            seq = 1
            if last:
                try:
                    seq = int(last.invoiceno[8:]) + 1
                except (ValueError, IndexError):
                    seq = 1
            self.invoiceno = f"{prefix}{seq:03d}"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.invoiceno


class SlRetItem(models.Model):
    slrethead = models.ForeignKey(
        SlRetHead, on_delete=models.CASCADE, related_name="items"
    )
    product = models.ForeignKey(
        Product, on_delete=models.PROTECT, related_name="slret_items"
    )
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    opnbalance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    clbalance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    purrate = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    salesrate = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    salesprice = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    cruser_id = models.IntegerField(default=0)
    upduser_id = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "slretitem"
        ordering = ["product__productname"]

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        if is_new:
            Product.objects.filter(pk=self.product_id).update(
                currentqty=models.F("currentqty") + self.quantity
            )

    def delete(self, *args, **kwargs):
        Product.objects.filter(pk=self.product_id).update(
            currentqty=models.F("currentqty") - self.quantity
        )
        super().delete(*args, **kwargs)

    def __str__(self):
        return f"{self.slrethead.invoiceno} — {self.product.productname}"


class ReplaceHead(models.Model):
    customer = models.ForeignKey(
        Customer, on_delete=models.PROTECT, related_name="replace_heads"
    )
    vouchercode = models.ForeignKey(
        VoucherCode, on_delete=models.PROTECT, related_name="replace_heads",
        null=True, blank=True
    )
    invoiceno = models.CharField(max_length=20, blank=True)
    saleinvoiceno = models.CharField(max_length=20, blank=True, null=True)
    invoicedate = models.DateField(null=True, blank=True)
    remark = models.CharField(max_length=200, blank=True, null=True)
    monthlist = models.ForeignKey(
        MonthList, on_delete=models.PROTECT, related_name="replace_heads",
        null=True, blank=True
    )
    yearlist = models.ForeignKey(
        YearList, on_delete=models.PROTECT, related_name="replace_heads",
        null=True, blank=True
    )
    cruser_id = models.IntegerField(default=0)
    upduser_id = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "replacehead"
        ordering = ["-invoicedate", "invoiceno"]

    def save(self, *args, **kwargs):
        if not self.pk and not self.invoiceno:
            self.invoiceno = _auto_invoiceno(ReplaceHead, "RPL")
        super().save(*args, **kwargs)

    def __str__(self):
        return self.invoiceno


class ReplaceItem(models.Model):
    replacehead = models.ForeignKey(
        ReplaceHead, on_delete=models.CASCADE, related_name="items"
    )
    product = models.ForeignKey(
        Product, on_delete=models.PROTECT, related_name="replace_items"
    )
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    opnbalance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    clbalance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    purrate = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    replacerate = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    replaceprice = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    cruser_id = models.IntegerField(default=0)
    upduser_id = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "replaceitem"
        ordering = ["product__productname"]

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        if is_new:
            Product.objects.filter(pk=self.product_id).update(
                currentqty=models.F("currentqty") - self.quantity
            )

    def delete(self, *args, **kwargs):
        Product.objects.filter(pk=self.product_id).update(
            currentqty=models.F("currentqty") + self.quantity
        )
        super().delete(*args, **kwargs)

    def __str__(self):
        return f"{self.replacehead.invoiceno} — {self.product.productname}"


class TransferHead(models.Model):
    fromcustomer = models.ForeignKey(
        Customer, on_delete=models.PROTECT, related_name="transfer_heads_from"
    )
    tocustomer = models.ForeignKey(
        Customer, on_delete=models.PROTECT, related_name="transfer_heads_to"
    )
    vouchercode = models.ForeignKey(
        VoucherCode, on_delete=models.PROTECT, related_name="transfer_heads",
        null=True, blank=True
    )
    invoiceno = models.CharField(max_length=20, blank=True)
    invoicedate = models.DateField(null=True, blank=True)
    remark = models.CharField(max_length=200, blank=True, null=True)
    monthlist = models.ForeignKey(
        MonthList, on_delete=models.PROTECT, related_name="transfer_heads",
        null=True, blank=True
    )
    yearlist = models.ForeignKey(
        YearList, on_delete=models.PROTECT, related_name="transfer_heads",
        null=True, blank=True
    )
    cruser_id = models.IntegerField(default=0)
    upduser_id = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "tranferhead"
        ordering = ["-invoicedate", "invoiceno"]

    def save(self, *args, **kwargs):
        if not self.pk and not self.invoiceno:
            self.invoiceno = _auto_invoiceno(TransferHead, "TRF")
        super().save(*args, **kwargs)

    def __str__(self):
        return self.invoiceno


class TransferItem(models.Model):
    transferhead = models.ForeignKey(
        TransferHead, on_delete=models.CASCADE, related_name="items"
    )
    product = models.ForeignKey(
        Product, on_delete=models.PROTECT, related_name="transfer_items"
    )
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    opnbalance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    clbalance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    purrate = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    transrate = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    transprice = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    cruser_id = models.IntegerField(default=0)
    upduser_id = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "tranferitem"
        ordering = ["product__productname"]

    def __str__(self):
        return f"{self.transferhead.invoiceno} — {self.product.productname}"


class DamageHead(models.Model):
    customer = models.ForeignKey(
        Customer, on_delete=models.PROTECT, related_name="damage_heads"
    )
    vouchercode = models.ForeignKey(
        VoucherCode, on_delete=models.PROTECT, related_name="damage_heads",
        null=True, blank=True
    )
    invoiceno = models.CharField(max_length=20, blank=True)
    invoicedate = models.DateField(null=True, blank=True)
    remark = models.CharField(max_length=200, blank=True, null=True)
    monthlist = models.ForeignKey(
        MonthList, on_delete=models.PROTECT, related_name="damage_heads",
        null=True, blank=True
    )
    yearlist = models.ForeignKey(
        YearList, on_delete=models.PROTECT, related_name="damage_heads",
        null=True, blank=True
    )
    cruser_id = models.IntegerField(default=0)
    upduser_id = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "damagehead"
        ordering = ["-invoicedate", "invoiceno"]

    def save(self, *args, **kwargs):
        if not self.pk and not self.invoiceno:
            from datetime import date as _date
            ref = self.invoicedate if self.invoicedate else _date.today()
            prefix = ref.strftime("%Y%m%d")
            last = (
                DamageHead.objects
                .filter(invoiceno__startswith=prefix)
                .order_by("-invoiceno")
                .first()
            )
            seq = 1
            if last:
                try:
                    seq = int(last.invoiceno[8:]) + 1
                except (ValueError, IndexError):
                    seq = 1
            self.invoiceno = f"{prefix}{seq:03d}"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.invoiceno


class DamageItem(models.Model):
    damagehead = models.ForeignKey(
        DamageHead, on_delete=models.CASCADE, related_name="items"
    )
    product = models.ForeignKey(
        Product, on_delete=models.PROTECT, related_name="damage_items"
    )
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    opnbalance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    clbalance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    purrate = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    damagerate = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    damageprice = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    cruser_id = models.IntegerField(default=0)
    upduser_id = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "damageitem"
        ordering = ["product__productname"]

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        if is_new:
            Product.objects.filter(pk=self.product_id).update(
                currentqty=models.F("currentqty") - self.quantity
            )

    def delete(self, *args, **kwargs):
        Product.objects.filter(pk=self.product_id).update(
            currentqty=models.F("currentqty") + self.quantity
        )
        super().delete(*args, **kwargs)

    def __str__(self):
        return f"{self.damagehead.invoiceno} — {self.product.productname}"
