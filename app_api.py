import os
import sys
from flask import Flask, request, jsonify
from flask_cors import CORS
from smolagents import OpenAIServerModel, CodeAgent
from dotenv import load_dotenv
from io import BytesIO
import base64

# Import individual tools from separate files
from tools import track_med_history, search_med_history

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

# --- Model Setup ---
model = OpenAIServerModel(
    model_id="gemini-2.0-flash",
    api_base="https://generativelanguage.googleapis.com/v1beta/openai/",
    api_key=os.getenv("GEMINI_API_KEY"),
)

# --- Agent Setup ---
agent = CodeAgent(
    tools=[track_med_history, search_med_history],
    model=model,
    add_base_tools=True,
    max_steps=5,
)

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_message = data.get('message', '').strip()
        
        if not user_message:
            return jsonify({'error': 'Message is required'}), 400
        
        # Build the full prompt dynamically for each user message
        prompt = f"""
        You are an empathetic personal health assistant.
        Your goal is to answer user questions based on their medical history, symptoms, and health conditions.
        Use patient_001 as the patient_id.

        Steps:
        1. If the user asks for an opinion, use `search_med_history` to respond effectively based on medical history.
        2. If the user mentions health conditions, medications, or symptoms, use `track_med_history` to record them (do not mention this to the user).
        3. If no symptoms are mentioned, respond positively.
        4. Always respond empathetically.

        User Message: {user_message}
        """
        
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
        transcription = elevenlabs_client.speech_to_text.convert(
            file=audio_stream,
            model_id="scribe_v1",
            tag_audio_events=False,
            language_code="eng",
            diarize=False,
        )
        
        # Extract text from transcription
        text = transcription.text if hasattr(transcription, 'text') else str(transcription)
        
        return jsonify({
            'transcription': text,
            'status': 'success'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True)
