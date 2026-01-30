from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q

from .models import Book
from .serializers import BookSerializer
from .ai_service import generate_book_summary, generate_text


class BookViewSet(viewsets.ModelViewSet):
    serializer_class = BookSerializer

    def get_queryset(self):
        """
        Supports search using ?q=
        """
        queryset = Book.objects.all().order_by("-id")
        q = self.request.query_params.get("q")

        if q:
            q = q.strip()
            queryset = queryset.filter(
                Q(title__icontains=q) |
                Q(author__icontains=q) |
                Q(isbn__icontains=q)
            )

        return queryset

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=False, methods=["post"])
    def generate_summary(self, request):
        title = request.data.get("title")
        author = request.data.get("author")

        if not title or not author:
            return Response(
                {"error": "Both title and author are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            summary = generate_book_summary(title, author)
            return Response({"summary": summary})
        except Exception as e:
            return Response(
                {"error": "AI service unavailable"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

    @action(detail=True, methods=["post"])
    def chat(self, request, pk=None):
        message = (request.data.get("message") or "").strip()
        if not message:
            return Response({"error": "Message is required"}, status=400)

        book = self.get_object()

        prompt = (
            f"You are a helpful assistant.\n"
            f"Book: {book.title}\n"
            f"Author: {book.author}\n\n"
            f"User message: {message}"
        )

        try:
            reply = generate_text(prompt)
            return Response({"reply": reply})
        except Exception:
            return Response(
                {"error": "AI service unavailable"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )