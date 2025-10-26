# Environment Variables Setup

Create a `.env` file in the root directory with the following structure:

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

## API Key Setup Instructions

### 1. ChromaDB API Keys
- Sign up at [ChromaDB](https://www.trychroma.com/)
- Navigate to your dashboard
- Get your:
  - `CHROMA_API_KEY`: Your API key
  - `CHROMA_TENANT`: Your tenant ID
  - `CHROMA_DATABASE`: Your database name

### 2. Gemini API Key
- Go to [Google AI Studio](https://aistudio.google.com/)
- Click "Get API Key"
- Create or select a project
- Copy your API key and set it as `GEMINI_API_KEY`

## Installation Steps

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Create the `.env` file with your API keys (see structure above)

3. Start the backend Flask server:
```bash
python app_api.py
```

4. In a separate terminal, start the frontend:
```bash
cd frontend
npm install  # if not already done
npm run dev
```

The chatbot will be available at `http://localhost:3000/chatbot` (or your configured port).
