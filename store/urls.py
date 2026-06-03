from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    CategoryViewSet,
    CircleOfficeViewSet,
    DepartmentViewSet,
    DesignationViewSet,
    DistrictOfficeViewSet,
    HeadOfficeViewSet,
    IssuanceRecordViewSet,
    MfccompanyViewSet,
    MonthCycleViewSet,
    MonthListViewSet,
    OfficeViewSet,
    ProductGroupViewSet,
    ProductViewSet,
    StatusViewSet,
    StockItemViewSet,
    UnitViewSet,
    UserRoleViewSet,
    YearListViewSet,
    UserViewSet,
    VoucherCodeViewSet,
    SupplierViewSet,
    PurchaseHeadViewSet,
    PurchaseItemViewSet,
    DeskViewSet,
    PurRetHeadViewSet,
    PurRetItemViewSet,
    CustomerViewSet,
    SalesHeadViewSet,
    SalesItemViewSet,
    SlRetHeadViewSet,
    SlRetItemViewSet,
    ReplaceHeadViewSet,
    ReplaceItemViewSet,
    TransferHeadViewSet,
    TransferItemViewSet,
    DamageHeadViewSet,
    DamageItemViewSet,
    RequisitionHeadViewSet,
    RequisitionItemViewSet,
    BudgetHeadViewSet,
    BudgetItemViewSet,
    PurchaseSummaryView,
    SalesSummaryView,
    PurchaseSalesReportView,
)

router = DefaultRouter()
router.register(r"categories", CategoryViewSet)
router.register(r"items", StockItemViewSet)
router.register(r"departments", DepartmentViewSet)
router.register(r"issuance-records", IssuanceRecordViewSet)
router.register(r"users", UserViewSet)
router.register("userroles", UserRoleViewSet)
router.register(r"head-offices", HeadOfficeViewSet)
router.register(r"circle-offices", CircleOfficeViewSet)
router.register(r"district-offices", DistrictOfficeViewSet)
router.register(r"offices", OfficeViewSet)
router.register(r"designations", DesignationViewSet)
router.register(r"status", StatusViewSet)
router.register(r"month-cycles", MonthCycleViewSet)
router.register(r"units", UnitViewSet)
router.register(r"month-list", MonthListViewSet)
router.register(r"year-list", YearListViewSet)
router.register(r"product-groups", ProductGroupViewSet)
router.register(r"mfc-companies", MfccompanyViewSet)
router.register(r"products", ProductViewSet)
router.register(r"voucher-codes", VoucherCodeViewSet)
router.register(r"suppliers", SupplierViewSet)
router.register(r"purchase-heads", PurchaseHeadViewSet)
router.register(r"purchase-items", PurchaseItemViewSet)
router.register(r"desks", DeskViewSet)
router.register(r"purret-heads", PurRetHeadViewSet)
router.register(r"purret-items", PurRetItemViewSet)
router.register(r"customers", CustomerViewSet)
router.register(r"sales-heads", SalesHeadViewSet)
router.register(r"sales-items", SalesItemViewSet)
router.register(r"slret-heads", SlRetHeadViewSet)
router.register(r"slret-items", SlRetItemViewSet)
router.register(r"replace-heads", ReplaceHeadViewSet)
router.register(r"replace-items", ReplaceItemViewSet)
router.register(r"transfer-heads", TransferHeadViewSet)
router.register(r"transfer-items", TransferItemViewSet)
router.register(r"damage-heads", DamageHeadViewSet)
router.register(r"damage-items", DamageItemViewSet)
router.register(r"requisition-heads", RequisitionHeadViewSet)
router.register(r"requisition-items", RequisitionItemViewSet)
router.register(r"budget-heads", BudgetHeadViewSet)
router.register(r"budget-items", BudgetItemViewSet)

urlpatterns = router.urls + [
    path("purchase-summary/", PurchaseSummaryView.as_view(), name="purchase-summary"),
    path("sales-summary/", SalesSummaryView.as_view(), name="sales-summary"),
    path("purchase-sales-report/", PurchaseSalesReportView.as_view(), name="purchase-sales-report"),
]
