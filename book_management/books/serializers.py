from rest_framework import serializers
from .models import Book, BookAssignment
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = "__all__"
        read_only_fields = ("created_by", "created_at", "updated_at")

    def validate_isbn(self, value):
        if len(value) != 13 or not value.isdigit():
            raise serializers.ValidationError("ISBN must be exactly 13 digits")
        return value


class BookAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = BookAssignment
        fields = "__all__"
        read_only_fields = ("id", "book", "total_amount", "assigned_by", "assigned_at")


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["username"] = user.username
        return token