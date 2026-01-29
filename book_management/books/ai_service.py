import os
from dotenv import load_dotenv

load_dotenv()

AI_PROVIDER = os.getenv("AI_PROVIDER", "gemini").lower()


def generate_text(prompt: str) -> str:
    if AI_PROVIDER == "openai":
        return _openai(prompt)
    elif AI_PROVIDER == "gemini":
        return _gemini(prompt)
    else:
        raise ValueError("Unsupported AI provider")


def generate_book_summary(book_name: str, author_name: str) -> str:
    """
    Backward compatible function
    Used by old /generate_summary endpoint
    """
    prompt = f"{book_name} by {author_name}. Share summary of this book in 3-4 lines."
    return generate_text(prompt)


def _openai(prompt: str) -> str:
    from openai import OpenAI

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY not set")

    client = OpenAI(api_key=api_key)

    response = client.responses.create(
        model="gpt-4.1-mini",
        input=prompt
    )

    return response.output_text.strip()


def _gemini(prompt: str) -> str:
    import google.generativeai as genai

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY not set")

    genai.configure(api_key=api_key)

    model = genai.GenerativeModel("gemini-2.0-flash")
    response = model.generate_content(prompt)

    if not response or not getattr(response, "text", None):
        raise RuntimeError("Gemini returned empty response")

    return response.text.strip()