import google.generativeai as genai
from app.config import GEMINI_API_KEY


class TranslationService:
    def __init__(self):
        if not GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is not configured.")

        genai.configure(api_key=GEMINI_API_KEY)
        self.model = genai.GenerativeModel("gemini-3.8-flash")

    def translate_segments(self, segments, target_language="Hindi"):
        """
        Translate transcript segments into the selected target language.
        Preserve segment timing and return one translation per segment.
        """

        if not segments:
            return []

        allowed_languages = {
            "Hindi", "English", "Spanish",
            "French", "German", "Japanese"
        }

        if target_language not in allowed_languages:
            raise ValueError(
                f"Unsupported target language: {target_language}"
            )

        english_text = "\n".join(
            f"{i + 1}. {seg['english']}"
            for i, seg in enumerate(segments)
        )

        prompt = f"""
You are an expert translator.

Translate the following English transcript into natural,
conversational {target_language}.

Rules:
- Return ONLY the translations.
- Keep exactly the same numbering.
- Return exactly {len(segments)} numbered lines.
- Do not add explanations.
- Do not skip, merge, or reorder any line.
- Keep names and meaning accurate.
- Translate into {target_language}, not Hindi unless Hindi is selected.

Transcript:
{english_text}
"""

        response = self.model.generate_content(prompt)
        output = (response.text or "").strip()

        # Match translations by their numbering.
        import re

        translations_by_number = {}

        for line in output.splitlines():
            match = re.match(r"^\s*(\d+)[.)]\s*(.*)$", line)

            if match:
                number = int(match.group(1))
                text = match.group(2).strip()

                if text:
                    translations_by_number[number] = text

        # Never silently substitute English for a missing translation.
        missing = [
            i + 1
            for i in range(len(segments))
            if i + 1 not in translations_by_number
        ]

        if missing:
            raise ValueError(
                "Translation response is incomplete. Missing segment "
                f"numbers: {missing}"
            )

        translated = []

        for i, seg in enumerate(segments, start=1):
            translated.append({
                "start": seg["start"],
                "end": seg["end"],
                "english": seg["english"],
                "hindi": translations_by_number[i]
            })

        return translated