from django.db import models
from django.contrib.auth.models import User

class Book(models.Model):
    title = models.CharField(max_length=250)
    author = models.CharField(max_length=120)
    isbn = models.CharField(max_length=13, unique=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    quantity = models.PositiveIntegerField(default=0)
    about = models.TextField(default="", blank=True)
    summary = models.TextField(default="", blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    created_by = models.ForeignKey(
        User, on_delete=models.CASCADE,
        null=True, blank=True, default=None
    )

    class Meta:
        db_table = "book_details"

    def __str__(self):
        return self.title


class BookAssignment(models.Model):
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name="assignments")
    person_name = models.CharField(max_length=150)
    quantity = models.PositiveIntegerField(default=1)

    # selling price per unit
    sell_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    assigned_by = models.ForeignKey(
        User, on_delete=models.SET_NULL,
        null=True, blank=True
    )

    assigned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "book_assignments"
        ordering = ["-assigned_at"]

    def save(self, *args, **kwargs):
        # auto calculate total
        self.total_amount = (self.sell_price or 0) * (self.quantity or 0)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.book.title} -> {self.person_name} ({self.quantity})"