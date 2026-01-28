#!/bin/bash

# AI Integration Setup Script for Book Management System

echo "=========================================="
echo "AI Integration Setup Script"
echo "=========================================="

# Check if we're in the correct directory
if [ ! -f "manage.py" ]; then
    echo "Error: Please run this script from the Django project root directory"
    echo "Expected: /Users/amanbansal/book_management/book_management/"
    exit 1
fi

# Install required packages
echo ""
echo "1. Installing required Python packages..."
pip install openai
echo "   ✓ OpenAI package installed"

pip install python-dotenv
echo "   ✓ python-dotenv package installed"

# Optional: Install other AI providers
read -p "Do you want to install Google Gemini support? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    pip install google-generativeai
    echo "   ✓ google-generativeai package installed"
fi

read -p "Do you want to install Anthropic Claude support? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    pip install anthropic
    echo "   ✓ anthropic package installed"
fi

# Create .env file if it doesn't exist
echo ""
echo "2. Setting up environment variables..."

if [ ! -f ".env" ]; then
    cat > .env << EOF
# AI Configuration
AI_PROVIDER=openai
OPENAI_API_KEY=your_openai_api_key_here

# Optional: For other AI providers
# GEMINI_API_KEY=your_gemini_api_key_here
# ANTHROPIC_API_KEY=your_anthropic_api_key_here
EOF
    echo "   ✓ Created .env file"
    echo "   ⚠ Please update .env with your actual API keys!"
else
    echo "   ⓘ .env file already exists"
fi

# Run migrations
echo ""
echo "3. Running database migrations..."
python manage.py migrate
echo "   ✓ Migrations completed"

# Summary
echo ""
echo "=========================================="
echo "Setup completed!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Update your .env file with your AI API key:"
echo "   nano .env"
echo ""
echo "2. Start the Django development server:"
echo "   python manage.py runserver"
echo ""
echo "3. Start the React frontend (in a new terminal):"
echo "   cd ../book-frontend"
echo "   npm run dev"
echo ""
echo "4. Navigate to 'Add Book' page and test 'Generate Summary with AI'"
echo ""
