from rest_framework.routers import DefaultRouter

from .views import CategoryViewSet, DepartmentViewSet, IssuanceRecordViewSet, StockItemViewSet, UserRoleViewSet, UserViewSet

router = DefaultRouter()
router.register(r"categories", CategoryViewSet)
router.register(r"items", StockItemViewSet)
router.register(r"departments", DepartmentViewSet)
router.register(r"issuance-records", IssuanceRecordViewSet) 
router.register(r"users", UserViewSet)
router.register("userroles", UserRoleViewSet)

urlpatterns = router.urls
