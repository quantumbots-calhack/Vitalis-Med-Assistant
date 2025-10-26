# Medical Assistant with RAG + Agentic AI

A comprehensive medical assistant application combining RAG (Retrieval-Augmented Generation) technology with Agentic AI, featuring a React/Next.js frontend and a Python Flask backend.

## Features

- **Intelligent Medical Assistant**: Powered by Gemini AI with RAG capabilities
- **Medical History Tracking**: Automatically tracks and retrieves patient medical history from ChromaDB
- **Empathetic Responses**: Context-aware, empathetic AI responses
- **Modern UI**: Beautiful, responsive frontend built with Next.js and Tailwind CSS
- **Authentication & Onboarding**: User authentication and medical profile setup

## Tech Stack

### Backend
- Python Flask
- Smol Agents
- ChromaDB (vector database)
- Google Gemini AI
- Python-dotenv for environment variables

### Frontend
- Next.js 14
- React
- TypeScript
- Tailwind CSS
- Zustand for state management
- Framer Motion for animations

## Installation

### Prerequisites

- Python 3.8+
- Node.js 18+
- ChromaDB API key
- Gemini API key

### Backend Setup

1. **Install Python dependencies**:
```bash
pip install -r requirements.txt
```

2. **Set up environment variables**:
Create a `.env` file in the root directory:

```env
# ChromaDB Configuration
CHROMA_API_KEY=your_chromadb_api_key_here
CHROMA_TENANT=your_chromadb_tenant_here
CHROMA_DATABASE=your_chromadb_database_here

# Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Flask Server Configuration
PORT=5000
```

**Where to get API keys:**
- **ChromaDB**: Sign up at [ChromaDB](https://www.trychroma.com/) and get your tenant, database, and API key from the dashboard
- **Gemini API**: Go to [Google AI Studio](https://aistudio.google.com/) and create an API key

3. **Start the Flask server**:
```bash
python app_api.py
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**:
```bash
cd frontend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Start the development server**:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Project Structure

```
.
├── app_api.py              # Flask backend API server
├── app.py                  # Original CLI chatbot (preserved)
├── tools/                  # Agent tools (track_med_history, search_med_history)
│   ├── __init__.py
│   └── history.py
├── requirements.txt          # Python dependencies
├── ENV_SETUP.md           # Detailed environment setup guide
├── frontend/               # Next.js frontend application
│   ├── src/
│   │   ├── app/           # Next.js app router pages
│   │   │   ├── auth/      # Authentication page
│   │   │   ├── chatbot/   # Main chatbot interface
│   │   │   ├── onboarding/ # Onboarding flow
│   │   │   └── ...
│   │   ├── components/     # React components
│   │   ├── lib/           # Utilities and stores
│   │   └── types/         # TypeScript types
│   └── ...
└── ...
```

## Usage

1. Start both the backend (Flask) and frontend (Next.js) servers
2. Navigate to `http://localhost:3000`
3. Authenticate or sign up
4. Complete the onboarding process
5. Start chatting with your medical assistant!

## API Endpoints

- `POST /api/chat`: Send a message to the chatbot
  - Request body: `{ "message": "your message" }`
  - Response: `{ "response": "assistant response" }`
  
- `GET /api/health`: Health check endpoint

## Features in Detail

### Medical History Tracking
The system automatically tracks:
- Health conditions
- Symptoms
- Medications
- Medical history entries

All stored in ChromaDB with patient-specific indexing.

### Agent Tools
- `track_med_history`: Analyzes and logs patient health information
- `search_med_history`: Retrieves comprehensive medical history

### Frontend Features
- User authentication
- Onboarding flow (basic info + medical profile)
- Real-time chatbot interface
- Responsive design
- Character animations

## Development

### Running the Development Servers

Backend:
```bash
python app_api.py
```

Frontend:
```bash
cd frontend && npm run dev
```

## Troubleshooting

### Backend not connecting
- Ensure Flask server is running on port 5000
- Check that `.env` file has correct API keys
- Verify ChromaDB and Gemini API keys are valid

### Frontend issues
- Check that the backend API is accessible at `http://localhost:5000`
- Verify CORS is enabled (already configured)
- Check browser console for errors

## License

[Your License Here]
