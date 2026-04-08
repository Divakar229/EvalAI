import google.generativeai as genai
import json, base64, tempfile, os, re
from pdf2image import convert_from_path
from PIL import Image
from google.generativeai.types import GenerationConfig
import io
from config import GEMINI_API_KEY

genai.configure(api_key=GEMINI_API_KEY)


ocr_model = genai.GenerativeModel(
    "gemini-2.5-flash",
    generation_config=GenerationConfig(temperature=0.0)
)

flash_model = genai.GenerativeModel(
    "gemini-2.5-flash-lite",  
    generation_config=GenerationConfig(temperature=0.0)
)

# A flag to tracks if Pro limit hit 
ocr_exhausted = False


def call_model(prompt, images=None, force_flash=False):
    global ocr_exhausted

    # Build parts list (to send data to Gemini) for Gemini
    def build_parts():
        parts = []
        if images:
            for img in images:
                parts.append({
                    # sending directly the file content
                    "inline_data": {
                        "mime_type": "image/jpeg",   # file format
                        "data": image_to_b64(img)    # actual image content
                    }
                })
        parts.append(prompt)
        return parts

    # Always use Flash Lite for evaluation (force_flash=True)
    # Or if flash already exhausted today
    if force_flash or ocr_exhausted:
        response = flash_model.generate_content(build_parts())
        return response.text

    # Try 2.5 flash for OCR(eg:for cursive writing)
    try:
        response = ocr_model.generate_content(build_parts())
        print("OCR: Gemini 2.5 Flash")
        return response.text

    except Exception as e:
        error = str(e).lower()
        print(f"ocr flash failed with: {e}")
        if "429" in error or "quota" in error or "rate" in error or "exhausted" in error:
            print("Flash ocr limit hit — switching to Flash for rest of the day")
            ocr_exhausted = True
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
    """Uses Flash for ocr. Falls back to Flash-lite if flash limit hit."""
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

        # force_flash=False → tries flash first, falls back if needed
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
11. 1 MARK QUESTIONS — be strict. Only award 1 mark if answer is
    completely correct. No partial marks for 1 mark questions.
12. CALCULATION QUESTIONS — if final answer is wrong due to 
    arithmetic error but method is correct, deduct at least 1 mark.
    Never give full marks if final answer is wrong.
13. WRONG ANSWERS — if student wrote a clearly wrong value 
    (example: pH=4 when correct is pH=3), deduct marks even if 
    formula is correct. Method marks maximum 50% for wrong answer.

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