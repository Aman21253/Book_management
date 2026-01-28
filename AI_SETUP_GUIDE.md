# Environment Configuration for AI Integration

## Backend Setup (Django)

Create a `.env` file in the `/Users/amanbansal/book_management/book_management/` directory with the following content:

```
OPENAI_API_KEY=your_openai_api_key_here
```

### Getting OpenAI API Key

1. Go to https://platform.openai.com/account/api-keys
2. Create a new API key
3. Copy the key and add it to your `.env` file

### Install Required Package

Run the following command in your Django project directory:

```bash
pip install openai
```

### Update settings.py

If needed, you can also add the API key to your `settings.py` using:

```python
import os
from dotenv import load_dotenv

load_dotenv()
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
```

Make sure to install python-dotenv:

```bash
pip install python-dotenv
```

## Database Migration

After adding the summary field to the Book model, run:

```bash
python manage.py migrate
```

## Testing the AI Integration

1. Start your Django server:
   ```bash
   python manage.py runserver
   ```

2. Start your React frontend:
   ```bash
   cd book-frontend
   npm run dev
   ```

3. Navigate to the "Add Book" page
4. Enter a book title and author name
5. Click "Generate Summary with AI"
6. The AI-generated summary will be populated in the About/Summary field

## Alternative AI Models

You can easily switch to other AI models by modifying the `ai_service.py` file:

### Using Google's Gemini

```python
import google.generativeai as genai
from django.conf import settings

genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

def generate_book_summary(book_name: str, author_name: str) -> str:
    model = genai.GenerativeModel('gemini-pro')
    prompt = f"{book_name} by {author_name} .. share summary of this book in 3-4 lines."
    response = model.generate_content(prompt)
    return response.text
```

Install: `pip install google-generativeai`

### Using Anthropic's Claude

```python
import anthropic

client = anthropic.Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))

def generate_book_summary(book_name: str, author_name: str) -> str:
    prompt = f"{book_name} by {author_name} .. share summary of this book in 3-4 lines."
    message = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=200,
        messages=[
            {"role": "user", "content": prompt}
        ]
    )
    return message.content[0].text
```

Install: `pip install anthropic`

## Features

- **Generate Summary**: Click the "Generate Summary with AI" button to auto-populate the summary field
- **Manual Override**: You can still manually edit the summary after generation
- **Error Handling**: Clear error messages if API calls fail
- **Loading States**: UI shows loading state while generating summaries
