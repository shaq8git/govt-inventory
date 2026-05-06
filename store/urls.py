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

urlpatterns = router.urls
