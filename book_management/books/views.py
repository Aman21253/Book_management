from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from django.db.models import F

from .models import Book, BookAssignment
from .serializers import BookSerializer, BookAssignmentSerializer

from .ai_service import generate_book_summary, generate_text


class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all().order_by("-id")
    serializer_class = BookSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    # ✅ Assign book (decrease quantity + save assignment)
    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def assign(self, request, pk=None):
        """
        POST /api/books/{id}/assign/
        Body:
        {
          "person_name": "Rahul",
          "quantity": 2,
          "sell_price": 199.00
        }
        """
        book = self.get_object()

        person_name = (request.data.get("person_name") or "").strip()
        qty = request.data.get("quantity")
        sell_price = request.data.get("sell_price")

        if not person_name:
            return Response({"error": "person_name is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            qty = int(qty)
        except:
            return Response({"error": "quantity must be a number"}, status=status.HTTP_400_BAD_REQUEST)

        if qty <= 0:
            return Response({"error": "quantity must be greater than 0"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            sell_price = float(sell_price)
        except:
            return Response({"error": "sell_price must be a number"}, status=status.HTTP_400_BAD_REQUEST)

        if sell_price < 0:
            return Response({"error": "sell_price cannot be negative"}, status=status.HTTP_400_BAD_REQUEST)

        # ✅ atomic update (important)
        with transaction.atomic():
            # refresh latest quantity inside transaction
            book = Book.objects.select_for_update().get(id=book.id)

            if book.quantity < qty:
                return Response(
                    {"error": f"Only {book.quantity} books available in stock"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # decrease quantity
            Book.objects.filter(id=book.id).update(quantity=F("quantity") - qty)

            # create assignment record
            assignment = BookAssignment.objects.create(
                book=book,
                person_name=person_name,
                quantity=qty,
                sell_price=sell_price,
                assigned_by=request.user
            )

            book.refresh_from_db()

        return Response({
            "message": "Book assigned successfully",
            "remaining_quantity": book.quantity,
            "assignment": BookAssignmentSerializer(assignment).data
        }, status=status.HTTP_200_OK)

    # ---- your existing actions remain below ----
    @action(detail=False, methods=["post"])
    def generate_summary(self, request):
        title = request.data.get("title")
        author = request.data.get("author")

        if not title or not author:
            return Response({"error": "Both title and author are required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            summary = generate_book_summary(title, author)
            return Response({"summary": summary}, status=status.HTTP_200_OK)
        except Exception as e:
            import traceback
            return Response(
                {"error": f"AI service unavailable. {str(e)}", "trace": traceback.format_exc()},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

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