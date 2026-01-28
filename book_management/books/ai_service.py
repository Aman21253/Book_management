import os

AI_PROVIDER = os.getenv("AI_PROVIDER", "gemini").lower()


def generate_book_summary(book_name: str, author_name: str) -> str:
    prompt = f"{book_name} by {author_name}. Share summary of this book in 3-4 lines."

    if AI_PROVIDER == "openai":
        return _openai(prompt)
    elif AI_PROVIDER == "gemini":
        return _gemini(prompt)
    else:
        raise ValueError("Unsupported AI provider")


def _openai(prompt: str) -> str:
    from openai import OpenAI
    import os

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY not set")

    client = OpenAI(api_key=api_key)

    response = client.responses.create(
        model="gpt-4.1-mini",
        input=prompt
    )

    return response.output_text.strip()


from google import genai

def _gemini(prompt: str) -> str:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY not set")

    client = genai.Client(api_key=api_key)
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt.strip()
    )
    if not response.text:
        raise RuntimeError("Gemini returned empty response")
    return response.text.strip()

def generate_text(prompt: str) -> str:
    if AI_PROVIDER == "openai":
        return _openai(prompt)
    elif AI_PROVIDER == "gemini":
        return _gemini(prompt)
    else:
        raise ValueError("Unsupported AI provider")