# Speech-to-Text Feature

## Overview

The chatbot now includes a speech-to-text feature that allows users to input messages using their voice instead of typing. This feature uses the native Web Speech API (built into modern browsers).

## Features

- **Live Transcription**: See your words appear in real-time as you speak
- **Continuous Recording**: Keep recording until you're done talking
- **Re-record Option**: Clear and start over if you make a mistake
- **Submit to Chatbot**: Send your voice-transcribed message to the AI assistant
- **Visual Feedback**: Microphone button pulses while recording

## How to Use

1. **Start Recording**: Click the microphone button (同) next to the text input
   - The button will turn red and pulse to indicate active recording
   
2. **Speak**: Start talking - your words will appear in real-time above the input box
   - Final transcriptions are in regular text
   - Current/pending transcriptions appear in italic gray text
   
3. **Stop Recording**: Click the microphone button again to stop
   
4. **Review & Send**: 
   - **Re-record**: Click "Re-record" to clear and start over
   - **Submit**: Click "Submit" to send your transcribed message to the chatbot

## Browser Compatibility

The Web Speech API is supported in:
- ✅ Chrome/Edge (Chromium)
- ✅ Safari (iOS 11+)
- ✅ Chrome on Android
- ⚠️ Firefox (partial support)

If your browser doesn't support the feature, the microphone button will be disabled.

## Technical Details

- Uses native `SpeechRecognition` API
- Language: English (US)
- Continuous recording mode for natural conversation flow
- Automatic error handling and reconnection

## User Experience

The recording interface provides:
- Visual indicator of recording state (pulsing microphone icon)
- Live transcription display with final and interim results
- Clear options to re-record or submit
- Seamless integration with the chatbot workflow
