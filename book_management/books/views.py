from django.db import transaction
from django.db.models import F, Q
from django.utils import timezone

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Book, BookAssignment, Student
from .serializers import (
    BookSerializer,
    BookAssignmentSerializer,
    StudentSerializer,
)
from .ai_service import generate_book_summary, generate_text


# ----------------------------
# Students
# ----------------------------
class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all().order_by("-id")
    serializer_class = StudentSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


# ----------------------------
# Books
# ----------------------------
class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all().order_by("-id")
    serializer_class = BookSerializer

    def get_queryset(self):
        queryset = Book.objects.all().order_by("-id")
        q = self.request.query_params.get("q")
        if q:
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

    # ----------------------------
    # AI Summary
    # ----------------------------
    @action(detail=False, methods=["post"], permission_classes=[permissions.IsAuthenticated])
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
            return Response(
                {"error": f"AI service unavailable. {str(e)}"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

    # ----------------------------
    # Chat
    # ----------------------------
    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
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
            return Response(
                {"error": f"AI service unavailable. {str(e)}"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )


# ----------------------------
# Assignments (Issue / Return)
# ----------------------------
class BookAssignmentViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET /api/assignments/
    GET /api/assignments/{id}/

    Issue:
      POST /api/assignments/issue/
      Body: { "student_id": 2, "book_id": 7, "issue": "2026-02-02" (optional) }

    Return:
      POST /api/assignments/return_item/
      Body: { "assignment_id": 10, "return_date": "2026-02-02" (optional) }
    """
    queryset = BookAssignment.objects.select_related("book", "student").all().order_by("-issue")
    serializer_class = BookAssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=["post"])
    def issue(self, request):
        student_id = request.data.get("student_id")
        book_id = request.data.get("book_id")
        issue_date = request.data.get("issue")  # optional

        if not student_id or not book_id:
            return Response(
                {"error": "student_id and book_id are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not Student.objects.filter(id=student_id).exists():
            return Response({"error": "Invalid student_id"}, status=status.HTTP_400_BAD_REQUEST)

        # issue_date: if not provided, use today's date
        if not issue_date:
            issue_date = timezone.localdate()

        with transaction.atomic():
            # Lock book row (avoid race condition)
            try:
                book = Book.objects.select_for_update().get(id=book_id)
            except Book.DoesNotExist:
                return Response({"error": "Invalid book_id"}, status=status.HTTP_400_BAD_REQUEST)

            if book.quantity <= 0:
                return Response({"error": "Book out of stock"}, status=status.HTTP_400_BAD_REQUEST)

            # Decrease stock
            Book.objects.filter(id=book_id).update(quantity=F("quantity") - 1)

            # Create assignment
            assignment = BookAssignment.objects.create(
                book_id=book_id,
                student_id=student_id,
                status=BookAssignment.STATUS_ISSUED,
                issue=issue_date,
                assigned_by=request.user
            )

            book.refresh_from_db()

        return Response({
            "message": "Book issued successfully",
            "transaction_id": str(assignment.transaction_id),
            "remaining_quantity": book.quantity,
            "assignment": BookAssignmentSerializer(assignment).data
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=["post"])
    def return_item(self, request):
        assignment_id = request.data.get("assignment_id")
        return_date = request.data.get("return_date")  # optional

        if not assignment_id:
            return Response({"error": "assignment_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        if not return_date:
            return_date = timezone.localdate()

        with transaction.atomic():
            try:
                assignment = BookAssignment.objects.select_for_update().select_related("book").get(id=assignment_id)
            except BookAssignment.DoesNotExist:
                return Response({"error": "Invalid assignment_id"}, status=status.HTTP_400_BAD_REQUEST)

            if assignment.status == BookAssignment.STATUS_RETURNED:
                return Response({"error": "This assignment is already returned"}, status=status.HTTP_400_BAD_REQUEST)

            # Update assignment
            assignment.status = BookAssignment.STATUS_RETURNED
            assignment.return_date = return_date
            assignment.save()

            # Increase stock
            Book.objects.filter(id=assignment.book_id).update(quantity=F("quantity") + 1)
            assignment.book.refresh_from_db()

        return Response({
            "message": "Book returned successfully",
            "book_id": assignment.book_id,
            "transaction_id": str(assignment.transaction_id),
            "updated_quantity": assignment.book.quantity,
            "assignment": BookAssignmentSerializer(assignment).data
        }, status=status.HTTP_200_OK)