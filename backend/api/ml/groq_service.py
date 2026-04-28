"""
groq_service.py — Central Groq API dispatcher for JobQuench AI features.
Model: llama3-70b-8192 (fast, free tier)
"""
import json
import os
from groq import Groq

# Read from environment variable (set via .env file loaded in settings.py)
GROQ_API_KEY = os.environ.get(
    "GROQ_API_KEY",
    ""
)
MODEL = "llama-3.3-70b-versatile"

_client = None

def get_client():
    global _client
    if _client is None:
        _client = Groq(api_key=GROQ_API_KEY)
    return _client


def _chat(messages, temperature=0.3, max_tokens=1024):
    """Send messages to Groq and return the response text."""
    try:
        client = get_client()
        response = client.chat.completions.create(
            model=MODEL,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        raise RuntimeError(f"Groq API error: {str(e)}")


# ─────────────────────────────────────────────────────────────
# 1. SENTIMENT ANALYSIS
# ─────────────────────────────────────────────────────────────
def analyze_sentiment(review_text: str) -> dict:
    """
    Analyze sentiment of a company review.
    Returns: { score: float (-1 to 1), label: str, summary: str }
    """
    prompt = f"""Analyze the sentiment of this company review and respond ONLY with valid JSON.

Review: "{review_text}"

Respond with exactly this JSON structure:
{{
  "score": <float between -1.0 and 1.0>,
  "label": "<one of: Very Positive, Positive, Neutral, Negative, Very Negative>",
  "summary": "<one sentence summary of the sentiment>"
}}"""

    try:
        raw = _chat([{"role": "user", "content": prompt}], temperature=0.1, max_tokens=200)
        start = raw.find('{')
        end = raw.rfind('}') + 1
        data = json.loads(raw[start:end])
        return {
            "score": float(data.get("score", 0.0)),
            "label": data.get("label", "Neutral"),
            "summary": data.get("summary", "")
        }
    except Exception:
        positive_words = ["great", "excellent", "amazing", "good", "love", "best", "fantastic", "wonderful"]
        negative_words = ["bad", "terrible", "poor", "worst", "horrible", "awful", "disappointing"]
        text_lower = review_text.lower()
        pos = sum(1 for w in positive_words if w in text_lower)
        neg = sum(1 for w in negative_words if w in text_lower)
        score = (pos - neg) / max(pos + neg, 1)
        label = "Positive" if score > 0.2 else "Negative" if score < -0.2 else "Neutral"
        return {"score": round(score, 2), "label": label, "summary": ""}


# ─────────────────────────────────────────────────────────────
# 2. RESUME PARSING — Full Profile Extraction
# ─────────────────────────────────────────────────────────────
def parse_resume_with_ai(resume_text: str) -> dict:
    """
    Extract ALL structured profile data from raw resume text using Groq.
    Returns a rich dict covering every student profile field.
    """
    prompt = f"""You are an expert resume parser for Indian engineering students. Extract ALL available information from this resume and respond ONLY with valid JSON.

Resume Text:
\"\"\"
{resume_text[:5000]}
\"\"\"

Respond with EXACTLY this JSON structure (use empty string or null for missing fields, never omit keys):
{{
  "first_name": "<first name only>",
  "last_name": "<last name only>",
  "email": "<email address>",
  "phone": "<phone number with country code if present>",
  "linkedin": "<full linkedin.com URL>",
  "github": "<full github.com URL>",
  "cgpa": <GPA/CGPA as float (e.g. 8.5) or null if not found>,
  "tenth_percentage": <10th/SSC percentage as float or null>,
  "twelfth_percentage": <12th/HSC/PU percentage as float or null>,
  "department": "<department abbreviation: CSE, ECE, EEE, IT, MECH, CIVIL, AIDS, or other>",
  "batch_year": <graduation year as integer e.g. 2025, or null>,
  "college": "<college or university name>",
  "skills": ["<technical skill 1>", "<technical skill 2>", ...],
  "soft_skills": ["<soft skill 1>", ...],
  "certifications": ["<cert 1>", "<cert 2>", ...],
  "languages": ["<programming or spoken language>", ...],
  "about": "<2-3 sentence professional summary derived from resume objective/summary section or synthesized from experience>",
  "roll_number": "<roll number or student ID if present, else empty string>"
}}

Rules:
- For cgpa: look for patterns like 'CGPA: 8.5', 'GPA 3.8', '8.5/10', '9.1 CGPA'
- For tenth_percentage: look for '10th', 'SSC', 'Matriculation', 'X'
- For twelfth_percentage: look for '12th', 'HSC', 'Intermediate', 'XII', 'PUC'
- For department: map 'Computer Science' -> 'CSE', 'Electronics' -> 'ECE', 'Information Technology' -> 'IT'
- For batch_year: look for graduation year, passout year, expected graduation
- Extract ALL technical skills: languages, frameworks, databases, tools, cloud, OS"""

    try:
        raw = _chat([{"role": "user", "content": prompt}], temperature=0.1, max_tokens=1200)
        start = raw.find('{')
        end = raw.rfind('}') + 1
        data = json.loads(raw[start:end])

        # Safe type coercion
        def safe_float(val):
            try:
                return round(float(val), 2) if val not in (None, '', 'null') else None
            except (ValueError, TypeError):
                return None

        def safe_int(val):
            try:
                return int(val) if val not in (None, '', 'null') else None
            except (ValueError, TypeError):
                return None

        def safe_list(val):
            if isinstance(val, list):
                return [str(s).strip() for s in val if str(s).strip()]
            return []

        return {
            "first_name":          data.get("first_name", "").strip(),
            "last_name":           data.get("last_name", "").strip(),
            "email":               data.get("email", "").strip(),
            "phone":               data.get("phone", "").strip(),
            "linkedin":            data.get("linkedin", "").strip(),
            "github":              data.get("github", "").strip(),
            "cgpa":                safe_float(data.get("cgpa")),
            "tenth_percentage":    safe_float(data.get("tenth_percentage")),
            "twelfth_percentage":  safe_float(data.get("twelfth_percentage")),
            "department":          data.get("department", "").strip().upper(),
            "batch_year":          safe_int(data.get("batch_year")),
            "college":             data.get("college", "").strip(),
            "skills":              safe_list(data.get("skills", [])),
            "soft_skills":         safe_list(data.get("soft_skills", [])),
            "certifications":      safe_list(data.get("certifications", [])),
            "languages":           safe_list(data.get("languages", [])),
            "about":               data.get("about", "").strip(),
            "roll_number":         data.get("roll_number", "").strip(),
        }
    except Exception as e:
        return {
            "first_name": "", "last_name": "", "email": "", "phone": "",
            "linkedin": "", "github": "", "cgpa": None, "tenth_percentage": None,
            "twelfth_percentage": None, "department": "", "batch_year": None,
            "college": "", "skills": [], "soft_skills": [], "certifications": [],
            "languages": [], "about": "", "roll_number": "",
            "error": str(e)
        }


# ─────────────────────────────────────────────────────────────
# 2b. AI RESUME ATS REVIEWER
# ─────────────────────────────────────────────────────────────
def review_resume_ats(resume_text: str, target_role: str = "Software Engineer") -> dict:
    """
    Review a resume for ATS compatibility and quality.
    Returns: { ats_score, overall_grade, strengths, issues, suggestions, missing_sections }
    """
    prompt = f"""You are an expert ATS (Applicant Tracking System) resume reviewer for Indian engineering campus placements.

Analyze this resume for a '{target_role}' position and respond ONLY with valid JSON.

Resume Text:
\"\"\"
{resume_text[:4000]}
\"\"\"

Respond with EXACTLY this JSON:
{{
  "ats_score": <integer 0-100 representing ATS compatibility>,
  "overall_grade": "<A, B, C, D, or F>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "issues": ["<issue 1>", "<issue 2>", "<issue 3>"],
  "suggestions": ["<actionable suggestion 1>", "<actionable suggestion 2>", "<actionable suggestion 3>", "<actionable suggestion 4>"],
  "missing_sections": ["<missing section 1>", ...],
  "keyword_density": "<Low, Medium, or High>",
  "format_score": <integer 0-100>,
  "content_score": <integer 0-100>
}}

Scoring criteria:
- ATS score: keyword presence, formatting (no tables/graphics), standard section headers, measurable achievements
- Strengths: what the resume does well
- Issues: specific problems that hurt ATS ranking or readability
- Suggestions: concrete improvements the student can make today
- Missing sections: important sections not found (e.g., Summary, Projects, Certifications, Achievements)"""

    try:
        raw = _chat([{"role": "user", "content": prompt}], temperature=0.2, max_tokens=800)
        start = raw.find('{')
        end = raw.rfind('}') + 1
        data = json.loads(raw[start:end])
        return {
            "ats_score":       int(data.get("ats_score", 50)),
            "overall_grade":   data.get("overall_grade", "C"),
            "strengths":       data.get("strengths", []),
            "issues":          data.get("issues", []),
            "suggestions":     data.get("suggestions", []),
            "missing_sections": data.get("missing_sections", []),
            "keyword_density": data.get("keyword_density", "Medium"),
            "format_score":    int(data.get("format_score", 50)),
            "content_score":   int(data.get("content_score", 50)),
        }
    except Exception:
        return _rule_based_ats(resume_text, target_role)


def _rule_based_ats(resume_text: str, target_role: str = "Software Engineer") -> dict:
    """Local rule-based ATS scoring — used when Groq is unavailable."""
    text = resume_text.lower()
    score = 0
    strengths, issues, suggestions, missing = [], [], [], []

    # ── Section presence (30 pts) ──────────────────────────────
    sections = {
        "education":     ["education", "b.tech", "b.e.", "bachelor", "university", "college", "cgpa", "gpa"],
        "experience":    ["experience", "internship", "intern", "work", "project", "projects"],
        "skills":        ["skills", "technical skills", "technologies", "tools", "languages"],
        "contact":       ["email", "phone", "linkedin", "github", "mobile"],
        "achievements":  ["achievement", "award", "certif", "hackathon", "winner", "published"],
    }
    found_sections = []
    for name, keywords in sections.items():
        if any(k in text for k in keywords):
            score += 6
            found_sections.append(name)
        else:
            missing.append(name.capitalize())

    if len(found_sections) >= 4:
        strengths.append("All key resume sections are present")
    if "contact" in found_sections:
        strengths.append("Contact information is clearly provided")
    if "experience" in found_sections:
        strengths.append("Work experience or projects are listed")

    # ── Keyword density (25 pts) ───────────────────────────────
    tech_keywords = [
        "python", "java", "javascript", "react", "node", "sql", "git",
        "machine learning", "deep learning", "django", "flask", "spring",
        "aws", "docker", "kubernetes", "tensorflow", "pytorch", "rest api",
        "data structure", "algorithm", "system design", "agile", "ci/cd",
    ]
    matched = [k for k in tech_keywords if k in text]
    kd_score = min(25, len(matched) * 2)
    score += kd_score
    density = "High" if kd_score >= 20 else "Medium" if kd_score >= 10 else "Low"
    if kd_score >= 15:
        strengths.append(f"Good keyword density with {len(matched)} technical keywords found")
    elif kd_score < 8:
        issues.append("Low technical keyword density — add more relevant skills")
        suggestions.append("List specific programming languages, frameworks and tools you have used")

    # ── Quantified achievements (20 pts) ──────────────────────
    import re
    numbers = re.findall(r'\d+[%+]?', text)
    if len(numbers) >= 5:
        score += 20
        strengths.append("Good use of metrics and quantified achievements")
    elif len(numbers) >= 2:
        score += 10
        suggestions.append("Add more measurable achievements (%, numbers, impact)")
    else:
        score += 0
        issues.append("No quantifiable metrics found — use numbers to show impact")
        suggestions.append("Example: 'Improved API response time by 40%' or 'Led a team of 5'")

    # ── Length and formatting (15 pts) ────────────────────────
    word_count = len(resume_text.split())
    if 300 <= word_count <= 900:
        score += 15
        strengths.append("Resume length is appropriate (concise and complete)")
    elif word_count < 300:
        score += 5
        issues.append("Resume is too short — add more detail to projects and experience")
        suggestions.append("Aim for 400–800 words with detailed project descriptions")
    else:
        score += 8
        issues.append("Resume may be too long — keep it to 1 page for campus placements")
        suggestions.append("Trim older or less relevant content to stay under 1 page")

    # ── Summary / objective (10 pts) ──────────────────────────
    if any(k in text for k in ["summary", "objective", "profile", "about me"]):
        score += 10
        strengths.append("Professional summary or objective is present")
    else:
        missing.append("Professional Summary")
        suggestions.append("Add a 2–3 line professional summary at the top of your resume")

    score = min(100, score)
    grade = "A" if score >= 85 else "B" if score >= 70 else "C" if score >= 55 else "D"

    return {
        "ats_score":        score,
        "overall_grade":    grade,
        "strengths":        strengths[:3],
        "issues":           issues[:3],
        "suggestions":      suggestions[:4],
        "missing_sections": missing,
        "keyword_density":  density,
        "format_score":     min(100, score + 5),
        "content_score":    min(100, kd_score * 4),
    }


# ─────────────────────────────────────────────────────────────
# 2c. COVER LETTER GENERATOR
# ─────────────────────────────────────────────────────────────
def generate_cover_letter(resume_text: str, job_title: str, company_name: str,
                           job_description: str, student_name: str = "") -> str:
    """
    Generate a personalised cover letter for a specific job.
    Returns: str (formatted cover letter)
    """
    prompt = f"""Write a professional, personalised cover letter for an Indian engineering student applying for a campus placement position.

Student Name: {student_name or 'the applicant'}
Target Job: {job_title}
Target Company: {company_name}

Resume Summary (use to personalise the letter):
\"\"\"
{resume_text[:2500]}
\"\"\"

Job Requirements:
\"\"\"
{job_description[:1000]}
\"\"\"

Write a compelling 3-paragraph cover letter that:
1. Opens with enthusiasm and the specific role/company
2. Highlights 2-3 specific skills/experiences from the resume that match the job
3. Closes with a strong call to action

Keep it professional, concise (250-300 words), and tailored. Do NOT use generic phrases like 'I am writing to express my interest'. Start strong."""

    try:
        return _chat([{"role": "user", "content": prompt}], temperature=0.6, max_tokens=600)
    except Exception as e:
        return f"Could not generate cover letter: {str(e)}"


# ─────────────────────────────────────────────────────────────
# 2d. MOCK INTERVIEW QUESTIONS FROM RESUME
# ─────────────────────────────────────────────────────────────
def generate_interview_questions(resume_text: str, job_title: str = "Software Engineer") -> dict:
    """
    Generate personalised mock interview questions based on resume content.
    Returns: { technical: [...], hr: [...], project: [...] }
    """
    prompt = f"""You are a senior technical interviewer. Generate personalised interview questions for a '{job_title}' campus placement interview based on this resume.

Resume:
\"\"\"
{resume_text[:3000]}
\"\"\"

Respond ONLY with valid JSON:
{{
  "technical": [
    "<specific technical question based on a skill/technology listed in resume 1>",
    "<specific technical question 2>",
    "<specific technical question 3>",
    "<specific technical question 4>",
    "<specific technical question 5>"
  ],
  "hr": [
    "<HR/behavioural question tailored to candidate 1>",
    "<HR question 2>",
    "<HR question 3>",
    "<HR question 4>"
  ],
  "project": [
    "<question about a specific project mentioned in resume 1>",
    "<question about a specific project 2>",
    "<question about a specific project 3>"
  ],
  "tips": ["<preparation tip 1>", "<preparation tip 2>", "<preparation tip 3>"]
}}

Make questions SPECIFIC to what's in the resume — mention actual project names, technologies, and experiences listed."""

    try:
        raw = _chat([{"role": "user", "content": prompt}], temperature=0.4, max_tokens=900)
        start = raw.find('{')
        end = raw.rfind('}') + 1
        data = json.loads(raw[start:end])
        return {
            "technical": data.get("technical", []),
            "hr":        data.get("hr", []),
            "project":   data.get("project", []),
            "tips":      data.get("tips", []),
        }
    except Exception as e:
        return {
            "technical": ["Tell me about your technical skills.", "Explain a challenging problem you solved."],
            "hr": ["Tell me about yourself.", "Why do you want to join this company?"],
            "project": ["Describe your most significant project."],
            "tips": ["Review your resume thoroughly before the interview."],
            "error": str(e)
        }


# ─────────────────────────────────────────────────────────────
# 3. PERSONALIZED READINESS TIPS
# ─────────────────────────────────────────────────────────────
def generate_readiness_tips(profile_data: dict) -> str:
    prompt = f"""You are a career counselor at a top engineering college. A student has the following placement readiness profile:

- CGPA: {profile_data.get('cgpa', 'N/A')} / 10
- Skills: {profile_data.get('skills', 'None listed')}
- Number of skills: {profile_data.get('skills_count', 0)}
- LinkedIn profile: {'Yes' if profile_data.get('has_linkedin') else 'No'}
- GitHub profile: {'Yes' if profile_data.get('has_github') else 'No'}
- Resume uploaded: {'Yes' if profile_data.get('has_resume') else 'No'}
- Jobs applied: {profile_data.get('applications_count', 0)}
- Overall readiness score: {profile_data.get('score', 0):.1f} / 100
- Department: {profile_data.get('department', 'Engineering')}

Give 3-4 specific, actionable, personalized tips to improve their placement chances. Be direct and encouraging. Keep each tip to 1-2 sentences. Format as a numbered list."""

    try:
        return _chat([{"role": "user", "content": prompt}], temperature=0.5, max_tokens=400)
    except Exception:
        return "Focus on building your skills, maintaining a strong CGPA, and applying to jobs regularly."


# ─────────────────────────────────────────────────────────────
# 4. SKILL GAP LEARNING ROADMAP
# ─────────────────────────────────────────────────────────────
def generate_skill_gap_roadmap(job_title: str, missing_skills: list, matched_skills: list) -> str:
    if not missing_skills:
        return "You have all the required skills for this job. Focus on deepening your expertise and building projects."

    prompt = f"""A student wants to apply for a '{job_title}' position.

Skills they already have: {', '.join(matched_skills) if matched_skills else 'None matching'}
Skills they need to learn: {', '.join(missing_skills)}

Create a concise 4-week learning roadmap to help them close these skill gaps. For each missing skill, suggest the best free resource (YouTube channel, documentation, or course). Be specific and practical. Format as a week-by-week plan."""

    try:
        return _chat([{"role": "user", "content": prompt}], temperature=0.4, max_tokens=600)
    except Exception:
        return f"Focus on learning: {', '.join(missing_skills)}. Use free resources on YouTube and official documentation."


# ─────────────────────────────────────────────────────────────
# 5. AI CAREER COACH CHAT
# ─────────────────────────────────────────────────────────────
SYSTEM_PROMPT = """You are JobQuench AI Career Coach, an expert assistant for engineering students preparing for campus placements in India.

You help students with:
- Resume writing and improvement tips
- Interview preparation (technical + HR rounds)
- Career guidance and job selection advice
- Skill development roadmaps
- CGPA improvement strategies
- Company-specific preparation (TCS, Infosys, Google, Microsoft, Amazon, etc.)
- Aptitude test preparation
- Coding interview preparation

Be friendly, encouraging, specific, and practical. Keep responses concise (under 300 words unless the student asks for more detail). Always relate advice to campus placements in India."""


def ai_career_chat(message: str, history: list = None) -> str:
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    if history:
        for msg in history[-10:]:
            if msg.get("role") in ("user", "assistant") and msg.get("content"):
                messages.append({"role": msg["role"], "content": msg["content"]})
    messages.append({"role": "user", "content": message})
    try:
        return _chat(messages, temperature=0.6, max_tokens=600)
    except Exception as e:
        return f"I'm having trouble connecting right now. Please try again. ({str(e)})"
