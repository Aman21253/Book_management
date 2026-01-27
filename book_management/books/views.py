from rest_framework import viewsets, permissions
from .models import Book
from .serializers import BookSerializer
from .pagination import BookPagination

class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all().order_by("-id")
    serializer_class = BookSerializer
    pagination_class = BookPagination

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]