# ElevenLabs Speech-to-Text Integration

## Overview

The chatbot now uses **ElevenLabs Speech-to-Text API** for voice input instead of the native Web Speech API. This provides more accurate transcription and better support across platforms.

## Setup Instructions

### 1. Get Your ElevenLabs API Key

1. Go to [ElevenLabs](https://elevenlabs.io/)
2. Sign up or log in to your account
3. Navigate to your profile/Settings
4. Find your API key
5. Copy the API key

### 2. Add API Key to .env File

Edit the `.env` file in the root directory:

```env
ELEVENLABS_API_KEY=your_api_key_here
```

Replace `your_api_key_here` with your actual ElevenLabs API key.

### 3. Install Dependencies

The ElevenLabs SDK has been added to `requirements.txt`. Install it by running:

```bash
pip install -r requirements.txt
```

Or specifically:

```bash
pip install elevenlabs
```

### 4. Restart the Backend

If the Flask server is running, restart it to load the new dependencies:

```bash
# Kill existing Flask process
pkill -f app_api.py

# Start it again
python app_api.py
```

## How to Use

1. **Start Recording**: Click the microphone button (同) next to the text input
   - Browser will ask for microphone permission
   - The button turns red and pulses while recording

2. **Speak**: Talk into your microphone
   - Your audio is recorded locally

3. **Stop Recording**: Click the microphone button again
   - Recording stops
   - Audio is sent to the backend for transcription
   - You'll see "Transcribing..." while it processes

4. **Review & Send**:
   - **Transcription appears**: Your transcribed text is displayed
   - **Re-record**: Click "Re-record" to start over
   - **Submit**: Click "Submit" to send your message to the chatbot

## How It Works

### Frontend (Browser)
- Uses `MediaRecorder` API to capture audio from microphone
- Records as `audio/webm` format
- Converts audio to base64 for transmission
- Sends audio to backend via `/api/transcribe` endpoint

### Backend (Flask)
- Receives base64 audio data
- Converts it to audio stream
- Sends to ElevenLabs Speech-to-Text API using `scribe_v1` model
- Returns transcribed text to frontend

### Flow
```
User speaks → Browser records audio → 
Audio sent to Flask → Flask sends to ElevenLabs → 
Transcription returned → Frontend displays text → 
User can edit/submit
```

## Technical Details

### Audio Format
- **Format**: WebM audio codec
- **Encoding**: Base64 for transmission
- **Quality**: Varies by browser and device

### ElevenLabs API
- **Model**: `scribe_v1`
- **Language**: English (`eng`)
- **Features**:
  - High accuracy transcription
  - Natural language understanding
  - Low latency

### Endpoints

**POST `/api/transcribe`**
- Accepts: `{ audio: base64_string }`
- Returns: `{ transcription: string, status: "success" }`

## Troubleshooting

### "Could not access microphone"
- Check browser permissions for microphone access
- Ensure microphone is not being used by another application
- Try refreshing the page and allowing permissions again

### "ElevenLabs API not configured"
- Check that `ELEVENLABS_API_KEY` is set in `.env`
- Restart the Flask server after adding the API key
- Verify the API key is valid

### "Error transcribing audio"
- Check internet connection
- Verify ElevenLabs API key is valid and has credits
- Check browser console for detailed errors

### No transcription appears
- Check backend terminal for errors
- Verify backend is running on port 5001
- Check network tab in browser dev tools

## Browser Support

- ✅ Chrome/Edge (Chromium) - Full support
- ✅ Safari - Full support
- ✅ Firefox - Full support  
- ⚠️ Opera - May vary

All modern browsers support the `MediaRecorder` API used for audio capture.

## Cost Considerations

- ElevenLabs has usage-based pricing
- Check your API dashboard for usage and costs
- Consider implementing rate limiting for production use

## Security Notes

- API key is stored in `.env` file (server-side only)
- Audio is sent to ElevenLabs servers for processing
- No audio is stored long-term
- Transcribed text follows the same security as regular chat messages
