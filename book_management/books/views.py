from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Book
from .serializers import BookSerializer
from .ai_service import generate_book_summary
from .ai_service import generate_text

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
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            # Return the actual error message for debugging
            import traceback
            return Response(
                {"error": f"AI service unavailable. {str(e)}", "trace": traceback.format_exc()},
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