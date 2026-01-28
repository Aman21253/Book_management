# Quick Start: AI Book Summary Generator

## ⚡ 5-Minute Setup

### Step 1: Get an API Key (2 min)

Choose one:

**OpenAI (Recommended)**
1. Go to https://platform.openai.com/account/api-keys
2. Click "Create new secret key"
3. Copy the key

**Google Gemini**
1. Go to https://makersuite.google.com/app/apikey
2. Click "Get API Key"
3. Copy the key

### Step 2: Install Dependencies (1 min)

```bash
cd /Users/amanbansal/book_management/book_management

# OpenAI
pip install openai python-dotenv

# OR Gemini
# pip install google-generativeai python-dotenv

# OR Claude
# pip install anthropic python-dotenv
```

### Step 3: Create .env File (1 min)

```bash
# Create .env in book_management directory
cat > .env << EOF
OPENAI_API_KEY=sk-your-key-here
EOF
```

Or for Gemini:
```bash
cat > .env << EOF
AI_PROVIDER=gemini
GEMINI_API_KEY=your-gemini-key-here
EOF
```

Or for Claude:
```bash
cat > .env << EOF
AI_PROVIDER=claude
ANTHROPIC_API_KEY=sk-ant-your-key-here
EOF
```

### Step 4: Migrate Database (1 min)

```bash
python manage.py migrate
```

## 🚀 Run It

Terminal 1 (Django):
```bash
cd /Users/amanbansal/book_management/book_management
python manage.py runserver
```

Terminal 2 (React):
```bash
cd /Users/amanbansal/book_management/book-frontend
npm run dev
```

## 💡 Test It

1. Open http://localhost:5173
2. Go to "Add Book"
3. Enter:
   - Title: "1984"
   - Author: "George Orwell"
4. Click "Generate Summary with AI"
5. Watch the summary appear! 🎉

## 🔧 Which AI Provider Should I Use?

| Provider | Best For | Cost | Speed |
|----------|----------|------|-------|
| **OpenAI** | Accuracy, quality | ~$0.0005/request | Fast |
| **Gemini** | Free option, good quality | Free tier available | Fast |
| **Claude** | Long context, detailed | Varies | Fast |

## ❓ Not Working?

**Error: "OPENAI_API_KEY not found"**
- Make sure `.env` file is in `/Users/amanbansal/book_management/book_management/`
- Check the API key is correct (should start with `sk-`)

**Error: "ModuleNotFoundError: No module named 'openai'"**
```bash
pip install openai
```

**API returns error**
- Check you have API credits
- Verify the API key is active
- Check internet connection

## 📚 Full Docs

See [AI_INTEGRATION_GUIDE.md](AI_INTEGRATION_GUIDE.md) for detailed documentation.

## Next Steps

- [ ] Customize summary length or style
- [ ] Add caching to save on API costs
- [ ] Implement batch summary generation
- [ ] Add summary history tracking

Enjoy! 🎊
