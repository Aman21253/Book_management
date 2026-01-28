# Generated migration for adding summary field to Book model

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('books', '0002_book_about_book_created_by_book_price_book_quantity_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='book',
            name='summary',
            field=models.TextField(blank=True, default='', null=True),
        ),
    ]
