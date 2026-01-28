# AI-Powered Book Summary Generation

This document explains how to use the AI-powered book summary generation feature in the Book Management System.

## Overview

The system integrates with AI services (OpenAI, Google Gemini, or Anthropic Claude) to automatically generate book summaries based on the book title and author name. The summaries are generated in 3-4 lines as requested.

## Architecture

### Backend Components

1. **ai_service.py** - Primary service using OpenAI
2. **ai_service_multi.py** - Multi-provider service supporting OpenAI, Gemini, and Claude
3. **views.py** - New `generate_summary` endpoint in BookViewSet
4. **models.py** - Updated Book model with `summary` field

### Frontend Components

1. **AddBook.jsx** - Updated with "Generate Summary with AI" button
2. **BookList.jsx** - Updated with inline summary generation capability
3. **aiService.js** - Utility functions for API calls

## Setup Instructions

### 1. Install Dependencies

```bash
cd /Users/amanbansal/book_management/book_management

# Install all AI packages
pip install -r ../ai_requirements.txt

# Or install individually
pip install openai python-dotenv
```

### 2. Configure API Keys

Create a `.env` file in `/Users/amanbansal/book_management/book_management/`:

```bash
# For OpenAI
AI_PROVIDER=openai
OPENAI_API_KEY=sk-your-api-key-here

# For Google Gemini (optional)
# GEMINI_API_KEY=your-gemini-key-here

# For Anthropic Claude (optional)
# ANTHROPIC_API_KEY=your-claude-key-here
```

### 3. Apply Database Migration

```bash
python manage.py migrate
```

This will add the `summary` field to the Book model.

### 4. Update Django Settings (Optional)

If using the multi-provider service, update `views.py` to use `ai_service_multi`:

```python
from .ai_service_multi import generate_book_summary
```

## Usage

### Adding a New Book with AI Summary

1. Navigate to **Add Book** page
2. Enter:
   - Book Title (required)
   - Author Name (required)
   - ISBN, Price, Quantity (required)
3. Click **"Generate Summary with AI"** button
4. Wait for the AI to generate a summary (2-5 seconds)
5. Review and edit the generated summary if needed
6. Click **"Add Book"** to save

### Generating Summary for Existing Books

1. Go to **Book List** page
2. Click the 👁️ icon next to a book to expand details
3. Click **"Generate AI Summary"** button
4. The summary will be generated and displayed

## API Endpoint

### Generate Summary

**POST** `/api/books/generate_summary/`

Request body:
```json
{
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald"
}
```

Response:
```json
{
  "summary": "The Great Gatsby follows Nick Carraway as he becomes entangled in the world of Jay Gatsby, a mysterious millionaire. Set in the Jazz Age, the novel explores themes of wealth, love, and the American Dream. Through lavish parties and hidden secrets, Fitzgerald reveals the corruption beneath the glamorous surface of 1920s New York."
}
```

## AI Providers

### OpenAI (Recommended)

- **Model**: gpt-3.5-turbo
- **Cost**: ~$0.0005 per request
- **Setup**: Get API key from https://platform.openai.com/account/api-keys
- **File**: `ai_service.py`

### Google Gemini

- **Model**: gemini-pro
- **Cost**: Free tier available
- **Setup**: Get API key from https://makersuite.google.com/app/apikey
- **Installation**: `pip install google-generativeai`
- **Usage**: Set `AI_PROVIDER=gemini` in `.env`

### Anthropic Claude

- **Model**: claude-3-5-sonnet-20241022
- **Cost**: Varies by tier
- **Setup**: Get API key from https://console.anthropic.com
- **Installation**: `pip install anthropic`
- **Usage**: Set `AI_PROVIDER=claude` in `.env`

## Features

✅ **Auto-generation**: Click a button to generate summaries instantly
✅ **Editable**: Edit generated summaries before saving
✅ **Multi-provider**: Switch between OpenAI, Gemini, or Claude
✅ **Error handling**: Clear error messages if API calls fail
✅ **Loading states**: Visual feedback during generation
✅ **Persistent**: Summaries are saved to the database
✅ **Safe**: API keys stored securely in environment variables

## Troubleshooting

### Issue: "OPENAI_API_KEY not found"

**Solution**: Make sure you've created the `.env` file in the correct directory and set the correct API key.

```bash
echo "OPENAI_API_KEY=sk-..." >> /Users/amanbansal/book_management/book_management/.env
```

### Issue: "ModuleNotFoundError: No module named 'openai'"

**Solution**: Install the OpenAI package:

```bash
pip install openai
```

### Issue: Summary generation times out

**Solution**: 
- Check your internet connection
- Verify API key is valid
- Check API account has credits
- Try switching to a different AI provider

### Issue: CORS error when calling API

**Solution**: The Django backend already has CORS enabled for localhost. Make sure:
- React frontend runs on port 5173
- Django backend runs on port 8000
- Both are on localhost

## Environment Variables

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| `AI_PROVIDER` | No | `openai` | Which AI service to use (openai, gemini, claude) |
| `OPENAI_API_KEY` | Yes (if using OpenAI) | `sk-...` | Your OpenAI API key |
| `GEMINI_API_KEY` | Yes (if using Gemini) | `AIza...` | Your Google Gemini API key |
| `ANTHROPIC_API_KEY` | Yes (if using Claude) | `sk-ant-...` | Your Anthropic API key |

## Performance Notes

- **First request**: 2-5 seconds (API call + response)
- **Subsequent requests**: Similar latency (each request is independent)
- **Rate limits**: Check your AI provider's rate limits for production use
- **Costs**: Monitor your API usage to manage costs

## Production Considerations

1. **API Key Security**: Store keys in a secrets manager (AWS Secrets Manager, Azure Key Vault)
2. **Rate Limiting**: Implement rate limiting to prevent abuse
3. **Caching**: Consider caching summaries to reduce API calls
4. **Error Handling**: Implement retry logic for failed requests
5. **Monitoring**: Log all API calls for debugging and analytics
6. **Cost Control**: Set up billing alerts on your AI provider account

## Future Enhancements

- [ ] Cache summaries to reduce API costs
- [ ] Add batch summary generation
- [ ] Support custom summary lengths
- [ ] Add summary quality ratings
- [ ] Implement fallback to alternative AI providers
- [ ] Add summary history and versioning
- [ ] Support multiple languages
- [ ] Add summary export functionality

## Support

For issues or questions about the AI integration, refer to:
- [OpenAI Documentation](https://platform.openai.com/docs)
- [Google Gemini Documentation](https://ai.google.dev/)
- [Anthropic Claude Documentation](https://docs.anthropic.com)
