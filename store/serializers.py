from django.contrib.auth import authenticate, get_user_model

from rest_framework import serializers

from .models import Category, StockItem, Department, IssuanceRecord, IssuanceLine, UserRole, DistrictOffice, Office

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

class DistrictOfficeSerializer(serializers.ModelSerializer):
    class Meta:
        model = DistrictOffice
        fields = ["id", "name"]


class OfficeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Office
        fields = ["id", "name", "district_office"]


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
