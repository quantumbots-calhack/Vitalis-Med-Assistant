"""
Email notification tool for alerting doctor about patient symptoms.
This tool generates draft emails and sends them using Gmail API.
"""
import os
import json
import base64
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, Optional
from dotenv import load_dotenv
from smolagents import tool
import google.generativeai as genai
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

load_dotenv()

# Gmail API scopes - need both send and profile to get sender email
SCOPES = [
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.readonly'  # Added to allow reading profile
]

# Doctor's email address
DOCTOR_EMAIL = "aayush418.patel@gmail.com"

# Initialize Gemini for email draft generation
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))


def get_gmail_service():
    """Get authenticated Gmail service."""
    creds = None
    
    # Token file stores the user's access and refresh tokens
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    
    # If there are no (valid) credentials available, prompt user to log in
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if not os.path.exists('credentials.json'):
                raise FileNotFoundError(
                    "credentials.json not found. Please set up Gmail API credentials. "
                    "See: https://developers.google.com/gmail/api/quickstart/python"
                )
            flow = InstalledAppFlow.from_client_secrets_file(
                'credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        
        # Save the credentials for the next run
        with open('token.json', 'w') as token:
            token.write(creds.to_json())
    
    service = build('gmail', 'v1', credentials=creds)
    return service


@tool
def generate_email_draft(
    patient_name: str,
    patient_age: int,
    symptom: str,
    additional_context: Optional[str] = None,
    patient_profile: Optional[Dict] = None
) -> str:
    """
    Generate a professional email draft to notify doctor about patient symptoms.
    
    Args:
        patient_name: Name of the patient
        patient_age: Age of the patient
        symptom: The symptom the patient is experiencing
        additional_context: Any additional context or details about the symptom
        patient_profile: Complete patient profile with medical history, medications, allergies, etc.
    
    Returns:
        JSON string with subject and body of the email draft
    """
    try:
        # Extract profile information
        allergies = ""
        medications = ""
        medical_history = ""
        sex = ""
        email = ""
        
        if patient_profile:
            try:
                if isinstance(patient_profile, str):
                    profile_data = json.loads(patient_profile)
                else:
                    profile_data = patient_profile
                    
                allergies = profile_data.get('allergies', 'None known')
                medications = profile_data.get('medications', 'None')
                medical_history = profile_data.get('medical_history', 'No significant history')
                sex = profile_data.get('sex', 'Not specified')
                email = profile_data.get('email', 'Not provided')
            except (json.JSONDecodeError, AttributeError):
                pass
        
        # Create comprehensive prompt for Gemini to generate email
        prompt = f"""Generate a professional medical alert email from a healthcare assistant to a doctor.

PATIENT INFORMATION:
- Name: {patient_name}
- Age: {patient_age}
- Sex: {sex}
- Email: {email}

SYMPTOM & PRESENTING COMPLAINT:
- Primary Symptom: {symptom}
- Additional Context: {additional_context or 'None provided'}

MEDICAL BACKGROUND:
- Current Medications: {medications}
- Known Allergies: {allergies}
- Medical History: {medical_history}

Generate a comprehensive, professional email focused on the SYMPTOM and its SEVERITY with:
1. A clear subject line indicating urgency (e.g., "Urgent Patient Alert: [Symptom] - [Patient Name]")
2. A professional email body organized as:
   - Patient identification and demographics
   - CHIEF COMPLAINT (the symptom, emphasized)
   - Severity assessment/patient's concern about severity
   - Relevant medical history that may relate to this symptom
   - Current medications that could be relevant
   - Known allergies that could impact treatment
   - Request for clinical guidance or appointment scheduling

The email should be centered around the SYMPTOM and why it's concerning enough to notify the doctor.

Format the response as JSON with 'subject' and 'body' fields.

Example format:
{{
    "subject": "Patient Alert: [Symptom] - [Patient Name]",
    "body": "[Professional, comprehensive email body]"
}}"""

        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(prompt)
        
        # Extract JSON from response
        response_text = response.text.strip()
        
        # Try to parse the JSON response
        try:
            # Remove markdown code blocks if present
            if response_text.startswith('```json'):
                response_text = response_text.replace('```json', '').replace('```', '').strip()
            elif response_text.startswith('```'):
                response_text = response_text.replace('```', '').strip()
            
            # Try to parse as JSON
            email_data = json.loads(response_text)
            
            # Validate structure
            if 'subject' not in email_data or 'body' not in email_data:
                raise ValueError("Response missing subject or body")
            
            return json.dumps(email_data, indent=2)
            
        except json.JSONDecodeError:
            # If JSON parsing fails, create a comprehensive response manually
            # Build a well-structured email with all available information
            body_sections = []
            body_sections.append(f"Dear Dr. Patel,")
            body_sections.append("")
            body_sections.append("PATIENT INFORMATION:")
            body_sections.append(f"- Name: {patient_name}")
            body_sections.append(f"- Age: {patient_age}")
            if sex:
                body_sections.append(f"- Sex: {sex}")
            if email:
                body_sections.append(f"- Email: {email}")
            
            body_sections.append("")
            body_sections.append("CHIEF COMPLAINT:")
            body_sections.append(f"- {symptom}")
            if additional_context:
                body_sections.append(f"- Additional context: {additional_context}")
            
            if medications and medications != "None":
                body_sections.append("")
                body_sections.append("CURRENT MEDICATIONS:")
                body_sections.append(f"- {medications}")
            
            if allergies and allergies != "None known":
                body_sections.append("")
                body_sections.append("KNOWN ALLERGIES:")
                body_sections.append(f"- {allergies}")
            
            if medical_history and medical_history != "No significant history":
                body_sections.append("")
                body_sections.append("MEDICAL HISTORY:")
                body_sections.append(f"- {medical_history}")
            
            body_sections.append("")
            body_sections.append("The patient has indicated this symptom is severe or concerning and requests your clinical guidance.")
            body_sections.append("")
            body_sections.append("Please advise on next steps or consider scheduling a follow-up appointment.")
            body_sections.append("")
            body_sections.append("Best regards,")
            body_sections.append("Medical Assistant")
            
            email_data = {
                "subject": f"Patient Alert: {symptom} - {patient_name}",
                "body": "\n".join(body_sections)
            }
            return json.dumps(email_data, indent=2)
            
    except Exception as e:
        # Create comprehensive fallback email with all available information
        body_sections = []
        body_sections.append(f"Dear Dr. Patel,")
        body_sections.append("")
        body_sections.append("PATIENT INFORMATION:")
        body_sections.append(f"- Name: {patient_name}")
        body_sections.append(f"- Age: {patient_age}")
        if sex:
            body_sections.append(f"- Sex: {sex}")
        
        body_sections.append("")
        body_sections.append("CHIEF COMPLAINT:")
        body_sections.append(f"- {symptom}")
        
        if medications and medications != "None":
            body_sections.append("")
            body_sections.append(f"CURRENT MEDICATIONS: {medications}")
        
        if allergies and allergies != "None known":
            body_sections.append("")
            body_sections.append(f"KNOWN ALLERGIES: {allergies}")
        
        body_sections.append("")
        body_sections.append("Please advise on next steps.")
        body_sections.append("")
        body_sections.append("Best regards,")
        body_sections.append("Medical Assistant")
        
        return json.dumps({
            "error": str(e),
            "subject": f"Patient Alert: {symptom} - {patient_name}",
            "body": "\n".join(body_sections)
        }, indent=2)


@tool
def send_email_to_doctor(
    subject: str,
    body: str,
    patient_email: Optional[str] = None
) -> str:
    """
    Send an email to the doctor using Gmail API.
    
    Args:
        subject: Email subject line
        body: Email body
        patient_email: Email address of the patient (optional)
    
    Returns:
        Status message indicating success or failure
    """
    try:
        print(f"[EMAIL] Attempting to get Gmail service...")
        service = get_gmail_service()
        print(f"[EMAIL] Gmail service obtained successfully")
        
        # Get sender email
        profile = service.users().getProfile(userId='me').execute()
        sender_email = profile['emailAddress']
        print(f"[EMAIL] Sending from: {sender_email}")
        print(f"[EMAIL] Sending to: {DOCTOR_EMAIL}")
        
        # Create email message
        message = MIMEMultipart()
        message['To'] = DOCTOR_EMAIL
        message['Subject'] = subject
        message['From'] = sender_email
        
        # Add body
        message.attach(MIMEText(body, 'plain'))
        
        # Create raw email
        raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
        
        # Send email
        print(f"[EMAIL] Sending email...")
        send_message = service.users().messages().send(
            userId='me',
            body={'raw': raw_message}
        ).execute()
        
        print(f"[EMAIL] Email sent successfully! Message ID: {send_message['id']}")
        
        return json.dumps({
            "status": "success",
            "message": f"Email sent successfully to {DOCTOR_EMAIL}",
            "message_id": send_message['id'],
            "sent_from": sender_email
        }, indent=2)
        
    except HttpError as error:
        print(f"[EMAIL ERROR] HttpError: {str(error)}")
        return json.dumps({
            "status": "error",
            "error": f"An error occurred: {str(error)}"
        }, indent=2)
    except Exception as e:
        print(f"[EMAIL ERROR] Exception: {str(e)}")
        import traceback
        print(f"[EMAIL ERROR] Traceback:")
        traceback.print_exc()
        return json.dumps({
            "status": "error",
            "error": str(e)
        }, indent=2)


@tool
def check_if_symptom_mentioned(user_message: str) -> str:
    """
    Check if a user message mentions a medical symptom.
    This is a simple heuristic to detect symptoms.
    
    Args:
        user_message: The user's message
    
    Returns:
        JSON string indicating if a symptom was mentioned
    """
    symptom_keywords = [
        'pain', 'ache', 'hurt', 'sore', 'uncomfortable', 'fever', 'cough',
        'headache', 'nausea', 'vomiting', 'dizzy', 'dizziness', 'tired', 'fatigue',
        'rash', 'itch', 'burning', 'bleeding', 'bruise', 'swelling', 'inflammation',
        'shortness of breath', 'difficulty breathing', 'chest pain', 'stomach ache',
        'diarrhea', 'constipation', 'indigestion', 'heartburn', 'back pain'
    ]
    
    user_lower = user_message.lower()
    
    for keyword in symptom_keywords:
        if keyword in user_lower:
            return json.dumps({
                "symptom_detected": True,
                "detected_symptom": keyword,
                "message": f"The user mentioned: {keyword}"
            }, indent=2)
    
    return json.dumps({
        "symptom_detected": False,
        "message": "No symptoms detected in the user's message"
    }, indent=2)

