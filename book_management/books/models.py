from django.db import models
from django.contrib.auth.models import User
import uuid


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


class Student(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=11, unique=True)
    address = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL,
        null=True, blank=True, default=None
    )

    class Meta:
        db_table = "students"

    def __str__(self):
        return self.name


class BookAssignment(models.Model):
    STATUS_ISSUED = "issued"
    STATUS_RETURNED = "returned"

    STATUS_CHOICES = [
        (STATUS_ISSUED, "Issued"),
        (STATUS_RETURNED, "Returned"),
    ]

    transaction_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)

    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name="assignments")
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="assignments", null=True, blank=True)
    issue = models.DateField(null=True, blank=True)
    return_date = models.DateField(null=True, blank=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_ISSUED)

    assigned_by = models.ForeignKey(
        User, on_delete=models.SET_NULL,
        null=True, blank=True
    )

    class Meta:
        db_table = "book_assignments"
        ordering = ["-issue"]

    def __str__(self):
        return f"{self.transaction_id} | {self.book.title} -> {self.student.name} ({self.status})"