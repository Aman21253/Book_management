from django.db import models
from django.contrib.auth.models import User

class Book(models.Model):
    title = models.CharField(max_length=250)
    author = models.CharField(max_length=120)
    isbn = models.CharField(max_length=13, unique=True)

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )
    quantity = models.PositiveIntegerField(default=0)
    about = models.TextField(default="", blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        default=None
    )

    class Meta:
        db_table = "book_details"

    def __str__(self):
        return self.title