"""
Placement Predictor — Training Script
======================================
Two training modes:

1. Train from real CSV dataset (recommended — 100k Indian students):
       python api/ml/train_model.py
   OR inside Django shell:
       from api.ml.train_model import train_from_csv; train_from_csv()

2. Train from live DB records:
       python manage.py shell -c "from api.ml.train_model import train; train()"

The trained model is saved as api/ml/placement_model.pkl
Feature vector (8 features):
    [cgpa, tenth_pct, twelfth_pct, skills_count, dept_code,
     has_internship/linkedin, has_projects/github, has_certs/resume]
"""

import os
import pickle
import csv

import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'placement_model.pkl')
CSV_PATH   = os.path.join(os.path.dirname(__file__), 'indian_students_dataset.csv')

# ── Department code mapping ────────────────────────────────────────────────
DEPARTMENT_MAP = {
    # Short codes (used by StudentProfile)
    'CSE': 0, 'ECE': 1, 'EEE': 2, 'MECH': 3,
    'CIVIL': 4, 'IT': 5, 'AIDS': 6, 'OTHER': 7,
    # Full names (used in CSV)
    'Computer Science and Engineering': 0,
    'Electronics and Communication Engineering': 1,
    'Electrical and Electronics Engineering': 2,
    'Mechanical Engineering': 3,
    'Civil Engineering': 4,
    'Information Technology': 5,
    'Artificial Intelligence and Data Science': 6,
    'AI and Data Science': 6,
}


def extract_features(profile):
    """
    Convert a StudentProfile ORM object → 8-feature vector for prediction.
    linkedin  → proxy for networking / internship activity
    github    → proxy for project portfolio
    resume    → proxy for job readiness / certifications
    """
    cgpa         = float(profile.cgpa)               if profile.cgpa               else 0.0
    tenth        = float(profile.tenth_percentage)   if profile.tenth_percentage   else 0.0
    twelfth      = float(profile.twelfth_percentage) if profile.twelfth_percentage else 0.0
    skills_count = len([s.strip() for s in profile.skills.split(',') if s.strip()]) if profile.skills else 0
    dept_code    = DEPARTMENT_MAP.get(profile.department, 7)
    has_linkedin = 1 if profile.linkedin_url else 0
    has_github   = 1 if profile.github_url   else 0
    has_resume   = 1 if profile.resume       else 0

    return [cgpa, tenth, twelfth, skills_count, dept_code,
            has_linkedin, has_github, has_resume]


def _row_to_features(row):
    """Convert one CSV row dict → 8-feature vector + label."""
    try:
        cgpa    = float(row.get('cgpa', 0) or 0)
        tenth   = float(row.get('tenth_percentage', 0) or 0)
        twelfth = float(row.get('twelfth_percentage', 0) or 0)

        skills_raw   = row.get('skills', '')
        skills_count = len([s.strip() for s in skills_raw.split(',') if s.strip()])

        dept_code = DEPARTMENT_MAP.get(row.get('department', '').strip(), 7)

        # Internship → proxy for linkedin/networking
        has_internship = 1 if str(row.get('internship_done', 'No')).strip().lower() == 'yes' else 0

        # num_projects > 0 → proxy for github/portfolio
        has_projects = 1 if int(row.get('num_projects', 0) or 0) > 0 else 0

        # num_certifications > 0 → proxy for resume/certifications
        has_certs = 1 if int(row.get('num_certifications', 0) or 0) > 0 else 0

        label = 1 if str(row.get('placement_status', '')).strip().lower() == 'placed' else 0

        features = [cgpa, tenth, twelfth, skills_count, dept_code,
                    has_internship, has_projects, has_certs]
        return features, label
    except (ValueError, TypeError):
        return None, None


def train_from_csv(csv_path=CSV_PATH):
    """
    Train a Random Forest on the real 100k Indian students dataset.
    This produces a far more accurate model than the DB-based trainer.
    """
    if not os.path.exists(csv_path):
        print(f"[ML] CSV not found at {csv_path}. Falling back to dummy model.")
        _save_dummy_model()
        return {'status': 'dummy', 'reason': 'csv_not_found'}

    print(f"[ML] Loading dataset from {csv_path} …")
    X, y = [], []

    with open(csv_path, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            features, label = _row_to_features(row)
            if features is not None:
                X.append(features)
                y.append(label)

    print(f"[ML] Loaded {len(X):,} samples  |  "
          f"Placed: {sum(y):,}  Not Placed: {len(y)-sum(y):,}")

    X = np.array(X, dtype=float)
    y = np.array(y, dtype=int)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=10,
        min_samples_leaf=5,
        random_state=42,
        class_weight='balanced',
        n_jobs=-1,
    )
    print("[ML] Training Random Forest (200 trees) …")
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    acc    = accuracy_score(y_test, y_pred)
    print(f"[ML] Test Accuracy: {acc:.2%}")
    print(classification_report(y_test, y_pred, target_names=['Not Placed', 'Placed']))

    with open(MODEL_PATH, 'wb') as f:
        pickle.dump(model, f)

    print(f"[ML] Model saved → {MODEL_PATH}")
    return {
        'status':   'trained_from_csv',
        'accuracy': round(acc, 4),
        'samples':  len(X),
        'placed':   int(sum(y)),
        'not_placed': int(len(y) - sum(y)),
    }


def train():
    """Train from live Django DB records (fallback if CSV unavailable)."""
    # Lazy import — only needed when running inside Django context
    import django
    if not os.environ.get('DJANGO_SETTINGS_MODULE'):
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
        django.setup()

    from api.models import StudentProfile

    profiles = StudentProfile.objects.all()
    X, y = [], []
    for p in profiles:
        X.append(extract_features(p))
        y.append(1 if p.is_placed else 0)

    if len(X) < 10:
        print(f"[ML] Only {len(X)} DB records — need ≥10. Using CSV dataset instead.")
        return train_from_csv()

    X = np.array(X)
    y = np.array(y)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = RandomForestClassifier(
        n_estimators=200, max_depth=10, random_state=42,
        class_weight='balanced', n_jobs=-1
    )
    model.fit(X_train, y_train)

    acc = accuracy_score(y_test, model.predict(X_test))
    print(f"[ML] DB-trained accuracy: {acc:.2%}")
    print(classification_report(y_test, model.predict(X_test),
                                target_names=['Not Placed', 'Placed']))

    with open(MODEL_PATH, 'wb') as f:
        pickle.dump(model, f)

    print(f"[ML] Model saved → {MODEL_PATH}")
    return {'status': 'trained_from_db', 'accuracy': acc, 'samples': len(X)}


def _save_dummy_model():
    """Fallback rule-based model when no data is available."""
    class DummyModel:
        def predict_proba(self, X):
            results = []
            for row in X:
                cgpa, _, _, skills, *_ = row
                prob = min(0.95, max(0.05, (cgpa / 10.0) * 0.6 + (min(skills, 10) / 10.0) * 0.4))
                results.append([1 - prob, prob])
            return np.array(results)

        def predict(self, X):
            return (self.predict_proba(X)[:, 1] >= 0.5).astype(int)

    with open(MODEL_PATH, 'wb') as f:
        pickle.dump(DummyModel(), f)
    print(f"[ML] Dummy model saved → {MODEL_PATH}")


def predict_for_profile(profile):
    """
    Given a StudentProfile instance, return placement probability (0–100 %).
    Auto-trains from CSV if no .pkl exists yet.
    """
    if not os.path.exists(MODEL_PATH):
        print("[ML] No model found — training from CSV dataset …")
        train_from_csv()

    with open(MODEL_PATH, 'rb') as f:
        model = pickle.load(f)

    features = extract_features(profile)
    X = np.array([features], dtype=float)
    proba = model.predict_proba(X)[0][1]
    return round(float(proba) * 100, 1)


if __name__ == '__main__':
    train_from_csv()
