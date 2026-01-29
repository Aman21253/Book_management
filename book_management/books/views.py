from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Book
from .serializers import BookSerializer
from .ai_service import generate_book_summary
from .ai_service import generate_text
import logging

logger = logging.getLogger(__name__)

class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all().order_by("-id")
    serializer_class = BookSerializer

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
            return Response({"summary": summary}, status=status.HTTP_200_OK)

        except ValueError as e:
            # Configuration or API key errors
            error_msg = str(e)
            logger.warning(f"Validation error generating summary: {error_msg}")
            return Response(
                {"error": error_msg},
                status=status.HTTP_400_BAD_REQUEST
            )

        except Exception as e:
            # Unexpected errors (API failures, network issues, etc.)
            error_msg = str(e)
            logger.error(f"Error generating summary: {error_msg}", exc_info=True)
            
            # Provide user-friendly error message
            user_message = "Unable to generate summary. Please try again later."
            if "quota" in error_msg.lower() or "429" in error_msg:
                user_message = "AI service quota exceeded. Please wait a moment and try again."
            elif "timeout" in error_msg.lower():
                user_message = "Request timed out. Please try again."
            elif "network" in error_msg.lower():
                user_message = "Network error. Please check your connection and try again."
            
            return Response(
                {
                    "error": user_message,
                    "detail": error_msg if request.user.is_staff else None
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        
    @action(detail=True, methods=["post"])
    def chat(self, request, pk=None):
        """
        POST /api/books/{id}/chat/
        Body: { "message": "..." }
        """
        message = (request.data.get("message") or "").strip()
        if not message:
            return Response({"error": "Message is required"}, status=status.HTTP_400_BAD_REQUEST)

        book = self.get_object()

        # Simple prompt context (you can improve later)
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