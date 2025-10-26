import os
import sys
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from io import BytesIO
import base64
import json

# Import shared agent configuration
from agent import create_agent, get_prompt
from tools.store_profile import get_patient_profile

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize ElevenLabs client
try:
    from elevenlabs import ElevenLabs
    elevenlabs_client = ElevenLabs(
        api_key=os.getenv("ELEVENLABS_API_KEY"),
    )
except Exception as e:
    print(f"Warning: Could not initialize ElevenLabs client: {e}")
    elevenlabs_client = None

# Create the agent instance using shared configuration
agent = create_agent()

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_message = data.get('message', '').strip()
        user_id = data.get('user_id')  # Get user_id from frontend
        
        if not user_message:
            return jsonify({'error': 'Message is required'}), 400
        
        # Determine patient ID
        patient_id = f"patient_{user_id}" if user_id else "patient_001"
        
        # Use the shared prompt function with patient_id
        prompt = get_prompt(user_message, patient_id)
        
        # Run the agent
        result = agent.run(prompt)
        
        return jsonify({
            'response': result
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/transcribe', methods=['POST'])
def transcribe_audio():
    """Transcribe audio using ElevenLabs Speech to Text API"""
    try:
        if not elevenlabs_client:
            return jsonify({'error': 'ElevenLabs API not configured'}), 500
        
        # Get audio data from request
        if 'audio' not in request.files and 'audio' not in request.json:
            return jsonify({'error': 'No audio data provided'}), 400
        
        # Handle different audio input formats
        if 'audio' in request.files:
            audio_file = request.files['audio']
            audio_data = audio_file.read()
        else:
            # Handle base64 encoded audio from frontend
            audio_base64 = request.json.get('audio')
            if audio_base64:
                # Remove data URL prefix if present
                if ',' in audio_base64:
                    audio_base64 = audio_base64.split(',')[1]
                audio_data = base64.b64decode(audio_base64)
            else:
                return jsonify({'error': 'No audio data provided'}), 400
        
        # Convert to BytesIO for ElevenLabs
        audio_stream = BytesIO(audio_data)
        
        # Transcribe using ElevenLabs
        print(f"[TRANSCRIBE] Starting transcription with ElevenLabs...")
        transcription = elevenlabs_client.speech_to_text.convert(
            file=audio_stream,
            model_id="scribe_v1",
            tag_audio_events=False,
            language_code="eng",
            diarize=False,
        )
        
        print(f"[TRANSCRIBE] Transcription response: {transcription}")
        
        # Extract text from transcription
        text = transcription.text if hasattr(transcription, 'text') else str(transcription)
        
        print(f"[TRANSCRIBE] Extracted text: {text}")
        
        return jsonify({
            'transcription': text,
            'status': 'success'
        })
        
    except Exception as e:
        print(f"[TRANSCRIBE ERROR] Failed to transcribe audio: {str(e)}")
        import traceback
        print(f"[TRANSCRIBE ERROR] Traceback:")
        traceback.print_exc()
        return jsonify({'error': f'Failed to transcribe audio: {str(e)}'}), 500

@app.route('/api/store-profile', methods=['POST'])
def store_profile():
    """Store patient profile data in ChromaDB for RAG"""
    try:
        from tools.store_profile import store_patient_profile
        
        data = request.json
        patient_id = data.get('patient_id')
        full_name = data.get('fullName')
        age = data.get('age')
        sex = data.get('sex')
        # Handle both camelCase and snake_case field names
        height_cm = data.get('height_cm') or data.get('heightCm')
        weight_kg = data.get('weight_kg') or data.get('weightKg')
        allergies = data.get('allergies', '')
        medications = data.get('medications', '')
        medical_history = data.get('medical_history') or data.get('history', '')
        email = data.get('email', '')
        
        if not all([patient_id, full_name, age, sex, height_cm, weight_kg]):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Store profile in ChromaDB
        result = store_patient_profile(
            patient_id=patient_id,
            full_name=full_name,
            age=age,
            sex=sex,
            height_cm=height_cm,
            weight_kg=weight_kg,
            allergies=allergies,
            medications=medications,
            medical_history=medical_history,
            email=email
        )
        
        return jsonify({
            'status': 'success',
            'message': 'Profile stored successfully'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/get-profile', methods=['POST'])
def get_profile():
    """Retrieve patient profile from ChromaDB"""
    try:
        from tools.store_profile import get_patient_profile
        
        data = request.json
        patient_id = data.get('patient_id')
        
        if not patient_id:
            return jsonify({'error': 'patient_id is required'}), 400
        
        # Get profile from ChromaDB
        profile_data = get_patient_profile(patient_id)
        
        return jsonify({
            'status': 'success',
            'profile': profile_data
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/generate-email-draft', methods=['POST'])
def generate_email_draft_endpoint():
    """Generate an email draft using Gemini"""
    try:
        from tools.email_notification import generate_email_draft

        data = request.json
        patient_name = data.get('patient_name')
        patient_age = data.get('patient_age')
        symptom = data.get('symptom')
        additional_context = data.get('additional_context')
        patient_profile = data.get('patient_profile', {})

        if not all([patient_name, patient_age, symptom]):
            return jsonify({'error': 'Missing required fields'}), 400

        result = generate_email_draft(
            patient_name=patient_name,
            patient_age=patient_age,
            symptom=symptom,
            additional_context=additional_context,
            patient_profile=patient_profile
        )

        return jsonify({
            'status': 'success',
            'draft': json.loads(result)
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/send-email', methods=['POST'])
def send_email_endpoint():
    """Send email to doctor using Gmail API"""
    try:
        from tools.email_notification import send_email_to_doctor
        
        data = request.json
        subject = data.get('subject')
        body = data.get('body')
        patient_email = data.get('patient_email')
        
        if not all([subject, body]):
            return jsonify({'error': 'Missing required fields'}), 400
        
        print(f"[EMAIL DEBUG] Attempting to send email with subject: {subject}")
        result = send_email_to_doctor(
            subject=subject,
            body=body,
            patient_email=patient_email
        )
        
        print(f"[EMAIL DEBUG] Email send result: {result}")
        
        return jsonify({
            'status': 'success',
            'result': json.loads(result)
        })
        
    except Exception as e:
        print(f"[EMAIL ERROR] Failed to send email: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True)
