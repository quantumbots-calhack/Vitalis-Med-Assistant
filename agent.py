"""
Shared agent configuration for the medical assistant.
This module provides the agent setup that can be used by both CLI and web API.
"""
import os
from smolagents import OpenAIServerModel, CodeAgent
from dotenv import load_dotenv

# Import individual tools from separate files
from tools import track_med_history, search_med_history, get_patient_profile, store_patient_profile
from tools.calendly_invite import get_available_times, book_appointment_simplified

# Load environment variables
load_dotenv()

def create_agent():
    """
    Create and return a configured CodeAgent instance.
    
    Returns:
        CodeAgent: Configured agent with all tools registered
    """
    # --- Model Setup ---
    model = OpenAIServerModel(
        model_id="gemini-2.0-flash",
        api_base="https://generativelanguage.googleapis.com/v1beta/openai/",
        api_key=os.getenv("GEMINI_API_KEY"),
    )
    
    # --- Agent Setup ---
    agent = CodeAgent(
        tools=[track_med_history, search_med_history, get_available_times, book_appointment_simplified, get_patient_profile, store_patient_profile],
        model=model,
        add_base_tools=True,
        max_steps=5,
    )
    
    return agent

def get_prompt(user_message: str, patient_id: str = "patient_001") -> str:
    """
    Generate the agent prompt for a user message.
    
    Args:
        user_message: The user's input message
        patient_id: The patient ID (defaults to "patient_001")
        
    Returns:
        str: Formatted prompt for the agent
    """
    return f"""
        You are an empathetic personal health assistant.
        Your goal is to answer user questions based on their medical history, symptoms, and health conditions.
        Use {patient_id} as the patient_id.

        Steps:
        1. If the user asks about their profile information (name, age, sex, height, weight, allergies, medications, medical history), first use `get_patient_profile` to retrieve their stored profile data, then answer based on that information.
        2. If the user asks for an opinion, use `search_med_history` to respond effectively based on medical history.
        3. If the user mentions health conditions, medications, or symptoms, use `track_med_history` to record them (do not mention this to the user).
        4. If the user asks about viewing appointment times, use `get_available_times` to get available times.
        5. If the user asks to book an appointment, ONLY ask for the date (YYYY-MM-DD) and time (HH:MM in 24-hour format). Do NOT ask for their name or email - they are already stored. Use `book_appointment_simplified` with event_type_slug="30min", the date, time, and {patient_id}.
        6. If no symptoms are mentioned, respond positively.
        7. If you require more information before using a tool, ask the user in a user-friendly manner. Never output pure code to the user, your responses should be fit for chatbot use.
        8. Always respond empathetically.

        User Message: {user_message}
        """

