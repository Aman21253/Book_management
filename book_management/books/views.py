from django.db.models import Q
from django.db import transaction

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Book
from .serializers import BookSerializer
from .ai_service import generate_book_summary, generate_text


class BookViewSet(viewsets.ModelViewSet):
    serializer_class = BookSerializer

    def get_queryset(self):
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
        # public
        if self.action in ["list", "retrieve"]:
            return [permissions.AllowAny()]

        # everything else needs login (assign, create, update, delete, chat, generate_summary)
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    # -------------------------
    # AI Summary
    # -------------------------
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
            return Response({"summary": summary}, status=status.HTTP_200_OK)
        except Exception as e:
            import traceback
            return Response(
                {"error": f"AI service unavailable. {str(e)}", "trace": traceback.format_exc()},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

    # -------------------------
    # Chat
    # -------------------------
    @action(detail=True, methods=["post"])
    def chat(self, request, pk=None):
        message = (request.data.get("message") or "").strip()
        if not message:
            return Response({"error": "Message is required"}, status=status.HTTP_400_BAD_REQUEST)

        book = self.get_object()

        prompt = (
            f"You are a helpful assistant for a book management system.\n"
            f"Book: {book.title}\n"
            f"Author: {book.author}\n\n"
            f"User message: {message}\n\n"
            f"Answer clearly and concisely."
        )

        try:
            reply = generate_text(prompt)
            return Response({"reply": reply}, status=status.HTTP_200_OK)
        except Exception as e:
            import traceback
            return Response(
                {"error": f"AI service unavailable. {str(e)}", "trace": traceback.format_exc()},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

    # -------------------------
    # ✅ Assign Book (Decrease Quantity)
    # -------------------------
    @action(detail=True, methods=["post"])
    def assign(self, request, pk=None):
        """
        POST /api/books/{id}/assign/
        Decrease quantity by 1 when assigned to a user.
        """
        book = self.get_object()

        if book.quantity <= 0:
            return Response(
                {"error": "Book is out of stock"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # ✅ atomic update (safe)
        with transaction.atomic():
            book.quantity -= 1
            book.save(update_fields=["quantity"])

        return Response(
            {
                "message": "Book assigned successfully",
                "remaining_quantity": book.quantity
            },
            status=status.HTTP_200_OK
        )