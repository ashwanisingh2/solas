import os
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def generate_structured(prompt: str) -> str:
    if not os.getenv("OPENAI_API_KEY"):
        return ""
    res = client.responses.create(
        model=os.getenv("OPENAI_MODEL", "gpt-4.1-mini"),
        input=prompt,
        temperature=0.2,
    )
    return res.output_text or ""
