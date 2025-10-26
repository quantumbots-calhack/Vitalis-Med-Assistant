# Setup Guide - Medical Assistant with RAG + Agentic AI

## ✅ Integration Complete

Your frontend chatbot is now connected to the functional RAG + Agentic AI backend! The UI/UX remains exactly the same, but now it uses the real backend instead of mock responses.

## 📋 What Was Changed

1. **Created `app_api.py`**: Flask API server with `/api/chat` endpoint
2. **Updated `frontend/src/app/chatbot/page.tsx`**: Now calls the backend API instead of using mock responses
3. **Updated `requirements.txt`**: Added Flask and flask-cors dependencies
4. **Created documentation**: README.md, ENV_SETUP.md, and this guide

## 🔑 API Key Setup Required

You need to create a `.env` file in the **root directory** (not in frontend/) with your API keys:

### Create `.env` file in root directory:

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

### Where to Get API Keys:

#### 1. ChromaDB (Vector Database)
- Go to: https://www.trychroma.com/
- Sign up for an account
- Create a new database
- From your dashboard, copy:
  - **CHROMA_API_KEY**: Your API key
  - **CHROMA_TENANT**: Your tenant ID
  - **CHROMA_DATABASE**: Your database name

#### 2. Gemini API Key
- Go to: https://aistudio.google.com/
- Click "Get API Key"
- Create a new project or select an existing one
- Copy the API key
- Set as **GEMINI_API_KEY**

⚠️ **IMPORTANT**: The `.env` file should be in the **root directory** (same level as `app_api.py`)

## 🚀 How to Run

### Option 1: Use the Start Script (Recommended)

```bash
./start.sh
```

This will:
- Install all Python dependencies
- Install all frontend dependencies
- Start the backend Flask server (port 5000)
- Start the frontend Next.js app (port 3000)

### Option 2: Manual Start

**Terminal 1 - Backend:**
```bash
# Install Python dependencies
pip install -r requirements.txt

# Start Flask server
python app_api.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install  # if not already done
npm run dev
```

## 🌐 Application URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## 🧪 Testing the Integration

1. Navigate to: http://localhost:3000
2. Sign up or log in
3. Complete the onboarding process
4. Go to the chatbot page
5. Try asking:
   - "I have a headache"
   - "What's my medical history?"
   - "I've been taking aspirin"

The chatbot will now use the real backend with ChromaDB and Gemini AI!

## 📁 File Structure

```
.
├── .env                      # ⚠️ CREATE THIS FILE with your API keys
├── app_api.py                # ✅ Flask API server (NEW)
├── app.py                    # Original CLI chatbot
├── requirements.txt          # ✅ Updated with Flask
├── tools/
│   ├── __init__.py
│   └── history.py            # Agent tools
├── frontend/
│   └── src/
│       └── app/
│           └── chatbot/
│               └── page.tsx  # ✅ Updated to use real backend
└── ...
```

## 🔧 Troubleshooting

### Backend Issues

**Problem**: `ModuleNotFoundError: No module named 'flask'`
**Solution**: Run `pip install -r requirements.txt`

**Problem**: `Error connecting to ChromaDB`
**Solution**: Check your `.env` file has correct ChromaDB credentials

**Problem**: `GEMINI_API_KEY not found`
**Solution**: Make sure `.env` file exists in root directory with correct key

### Frontend Issues

**Problem**: Frontend can't connect to backend
**Solution**: 
1. Ensure Flask server is running on port 5000
2. Check backend terminal for errors
3. Verify CORS is enabled (already configured in app_api.py)

**Problem**: "Failed to get response from server"
**Solution**: Check that backend is running and .env file has valid API keys

## ✨ What Remains the Same

- ✅ All UI/UX remains exactly the same
- ✅ Authentication flow unchanged
- ✅ Onboarding flow unchanged
- ✅ Character animations unchanged
- ✅ Message history display unchanged
- ✅ All other frontend features work as before

## 🎯 What's New

- ✅ Real AI responses from Gemini
- ✅ Medical history tracking in ChromaDB
- ✅ Backend API for chatbot functionality
- ✅ Production-ready backend integration

## 📝 Next Steps

1. Create `.env` file with your API keys
2. Run `./start.sh` or start both servers manually
3. Test the chatbot functionality
4. Start building additional features!

## 🆘 Need Help?

- Check `ENV_SETUP.md` for detailed API key setup
- Check `README.md` for full project documentation
- Check backend terminal for error logs
- Check browser console (F12) for frontend errors
