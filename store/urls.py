from rest_framework.routers import DefaultRouter

from .views import CategoryViewSet, DepartmentViewSet, IssuanceRecordViewSet, StockItemViewSet

router = DefaultRouter()
router.register(r"categories", CategoryViewSet)
router.register(r"items", StockItemViewSet)
router.register(r"departments", DepartmentViewSet)
router.register(r"issuance-records", IssuanceRecordViewSet) 

urlpatterns = router.urls
