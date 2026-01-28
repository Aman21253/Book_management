# Getting Your OpenAI API Key - Step by Step

## Method 1: OpenAI (Recommended for Testing)

### Step 1: Go to OpenAI Platform
Open your browser and go to: https://platform.openai.com/account/api-keys

### Step 2: Create or Copy API Key
1. If you don't have an account, create one (free)
2. Click **"Create new secret key"**
3. A popup will show your new API key starting with `sk-`
4. **Copy the entire key** (you won't see it again)

### Step 3: Add to Your Project
1. Open a terminal and navigate to the project:
   ```bash
   cd /Users/amanbansal/book_management/book_management
   ```

2. Edit the .env file:
   ```bash
   nano .env
   ```

3. Find this line:
   ```
   OPENAI_API_KEY=sk-your-openai-api-key-here
   ```

4. Replace `sk-your-openai-api-key-here` with your actual key:
   ```
   OPENAI_API_KEY=sk-proj-abc123xyz...
   ```

5. Save the file (Ctrl+X, then Y, then Enter in nano)

### Step 4: Test It
1. Django server should still be running
2. Go to http://localhost:5173
3. Navigate to "Add Book"
4. Enter Title: "The Great Gatsby"
5. Enter Author: "F. Scott Fitzgerald"
6. Click "Generate Summary with AI"
7. Wait a few seconds - should see a generated summary! ✅

## Method 2: Alternative - Modify .env Directly

Instead of using nano, you can create/edit the file another way:

```bash
# Option A: Using echo (replaces entire file)
echo "OPENAI_API_KEY=sk-your-key-here" > /Users/amanbansal/book_management/book_management/.env

# Option B: Using VS Code
# Open /Users/amanbansal/book_management/book_management/.env in VS Code and edit

# Option C: Using cat (paste your key when prompted)
cat > /Users/amanbansal/book_management/book_management/.env << EOF
OPENAI_API_KEY=sk-your-key-here
AI_PROVIDER=openai
EOF
```

## Verify API Key Works

After updating the .env file, test immediately:

1. **Check Django Logs**
   - Look at Django terminal output for any errors
   - Should show no import errors

2. **Try API Call**
   ```bash
   curl -X POST http://localhost:8000/api/books/generate_summary/ \
     -H "Content-Type: application/json" \
     -d '{"title":"1984","author":"George Orwell"}'
   ```
   
   Expected response:
   ```json
   {
     "summary": "George Orwell's 1984 is a dystopian novel..."
   }
   ```

3. **Try from UI**
   - Click "Add Book"
   - Fill title and author
   - Click "Generate Summary with AI"
   - Should work without errors ✅

## Troubleshooting API Key Issues

### Error: "Invalid API key"
- Your key is incorrect or expired
- Copy-paste might have extra spaces
- Try getting a new key from OpenAI

### Error: "Insufficient quota"
- Your OpenAI account has no credits
- Add a payment method to OpenAI account
- Or use free trial credits

### Error: "Rate limit exceeded"
- You've made too many requests too quickly
- Wait a minute and try again
- This is normal during testing

### Error: "API key not found"
- .env file is not in the correct location
- Should be: `/Users/amanbansal/book_management/book_management/.env`
- Make sure file name is exactly `.env` (not `.env.txt` or similar)
- Check that OPENAI_API_KEY line is present

## FAQ

**Q: Is OpenAI free?**
A: You get $5 in free credits for new accounts. After that, you pay per request (~$0.0005 per summary).

**Q: Can I use a different AI provider?**
A: Yes! The system supports Google Gemini and Anthropic Claude. See AI_INTEGRATION_GUIDE.md for details.

**Q: Will my API key be safe?**
A: Yes, it's stored only in .env file which is not uploaded to Git. Never commit .env to version control.

**Q: How do I revoke the API key if leaked?**
A: Go to https://platform.openai.com/account/api-keys and delete the key. Create a new one.

**Q: How do I check my API usage/costs?**
A: Go to https://platform.openai.com/account/billing/overview

## Quick Reference

| Item | Location |
|------|----------|
| API Key File | `/Users/amanbansal/book_management/book_management/.env` |
| Get API Key | https://platform.openai.com/account/api-keys |
| Django Server | http://localhost:8000 |
| React App | http://localhost:5173 |
| API Endpoint | POST http://localhost:8000/api/books/generate_summary/ |

## Need Help?

1. Check SETUP_COMPLETE.md for server status
2. Check QUICK_START.md for quick troubleshooting
3. Check AI_INTEGRATION_GUIDE.md for detailed docs
4. Review error messages in browser console (F12)

---

**Once you add your API key and restart Django, the AI feature will be fully operational!** ✅
