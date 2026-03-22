import google.generativeai as genai
import json, base64, tempfile, os, re
from pdf2image import convert_from_path
from PIL import Image
import io
from config import GEMINI_API_KEY

genai.configure(api_key=GEMINI_API_KEY)

pro_model   = genai.GenerativeModel("gemini-2.5-pro")
flash_model = genai.GenerativeModel("gemini-2.5-flash")

# This flag tracks if Pro limit is hit for the day
pro_exhausted = False


def call_model(prompt, images=None, force_flash=False):
    global pro_exhausted

    # Build parts list for Gemini
    def build_parts():
        parts = []
        if images:
            for img in images:
                parts.append({
                    "inline_data": {
                        "mime_type": "image/jpeg",
                        "data": image_to_b64(img)
                    }
                })
        parts.append(prompt)
        return parts

    # Always use Flash for evaluation (force_flash=True)
    # Or if Pro already exhausted today
    if force_flash or pro_exhausted:
        response = flash_model.generate_content(build_parts())
        return response.text

    # Try Pro for OCR
    try:
        response = pro_model.generate_content(build_parts())
        print("OCR: Gemini 2.5 Pro")
        return response.text

    except Exception as e:
        error = str(e).lower()
        if "429" in error or "quota" in error or "rate" in error or "exhausted" in error:
            print("Pro limit hit — switching to Flash for rest of the day")
            pro_exhausted = True
            response = flash_model.generate_content(build_parts())
            return response.text
        else:
            raise e


def pdf_to_images(pdf_bytes: bytes) -> list:
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as f:
        f.write(pdf_bytes)
        tmp = f.name
    try:
        return convert_from_path(tmp, dpi=200)
    finally:
        os.unlink(tmp)


def image_to_b64(img: Image.Image) -> str:
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=90)
    return base64.b64encode(buf.getvalue()).decode()


def clean_json(text: str) -> str:
    text = text.strip()
    text = re.sub(r"```json\s*", "", text)
    text = re.sub(r"```\s*", "", text)
    return text.strip()


def extract_text(images: list, hint: str) -> str:
    """Uses Pro. Falls back to Flash if Pro limit hit."""
    all_text = []
    for i in range(0, len(images), 4):
        batch = images[i:i + 4]
        prompt = f"""{hint}
- Transcribe EVERYTHING exactly as written
- Preserve all question numbers and sub-parts (a, b, i, ii)
- Crossed/cut text → write [CROSSED OUT: ...] then transcribe what follows
- Blank question → write [QUESTION X: BLANK]
- Diagram drawn → write [DIAGRAM PRESENT: description]
- Do not correct spelling or grammar
- Output ONLY raw transcription"""

        # force_flash=False → tries Pro first, falls back if needed
        text = call_model(prompt, images=batch, force_flash=False)
        all_text.append(text)

    return "\n\n---PAGE BREAK---\n\n".join(all_text)


def parse_question_paper(qp_text: str) -> dict:
    """No images — always Flash."""
    prompt = f"""Parse this Indian exam question paper. Extract every question with marks.

{qp_text}

Rules:
1. CHOICE questions have OR / EITHER..OR → is_choice: true, marks = ONE option only
2. PART questions (a,b both compulsory) → is_choice: false, list parts
3. STEPWISE questions (maths/science) → is_stepwise: true
4. Questions expecting diagrams → is_diagram_expected: true
5. total_marks = sum of all questions (choice counted once)

Return ONLY valid JSON:
{{
  "total_marks": <number>,
  "subject_hint": "<maths|science|english|history|other>",
  "questions": [
    {{
      "question_number": "1",
      "question_text": "...",
      "marks": 5,
      "is_choice": false,
      "is_stepwise": false,
      "is_diagram_expected": false,
      "parts": null
    }}
  ]
}}"""
    # force_flash=True → always Flash, no images
    return json.loads(clean_json(call_model(prompt, force_flash=True)))


def evaluate_answers(questions_data: dict, answer_key_text: str, student_text: str) -> dict:
    """No images — always Flash."""
    total = questions_data.get("total_marks", 100)
    prompt = f"""You are an experienced, fair Indian teacher evaluating an answer sheet.

QUESTION PAPER:
{json.dumps(questions_data, indent=2)}

ANSWER KEY:
{answer_key_text}

STUDENT ANSWER SHEET:
{student_text}

EVALUATION RULES:
1. Match answers by question number, NOT page order
2. CHOICE questions → score each attempted part, take MAX, never add both
3. PART questions → score each part within its own marks, add for total
4. STEPWISE → marks for each correct step even if final answer is wrong
5. KEYWORDS → key terms present = credit even if explanation is weak
6. DIAGRAMS → [DIAGRAM PRESENT] = give diagram marks
7. ATTEMPT CREDIT → relevant but incomplete = min 1 mark if question > 2 marks
8. CROSSED OUT → ignore [CROSSED OUT: ...] entirely
9. Never cut marks for handwriting or presentation
10. Benefit of doubt when unclear. Half marks acceptable.

Return ONLY valid JSON:
{{
  "marks_obtained": <number>,
  "total_marks": {total},
  "percentage": <one decimal>,
  "grade": "<A+|A|B|C|D|F>",
  "overall_remarks": "<2 sentence honest teacher remark>",
  "questions": [
    {{
      "question_number": "1",
      "question_text": "...",
      "total_marks": 5,
      "marks_awarded": 4,
      "status": "<answered|blank|partial>",
      "is_choice": false,
      "is_stepwise": false,
      "student_answer_summary": "...",
      "feedback": "...",
      "parts": null
    }}
  ]
}}"""
    # force_flash=True → always Flash, no images
    return json.loads(clean_json(call_model(prompt, force_flash=True)))