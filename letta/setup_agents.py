import os
from letta_client import Letta
from dotenv import load_dotenv
from tools import search_med_history, track_med_history

load_dotenv()

# Initialize the Letta client
client = Letta(token=os.getenv("LETTA_API_KEY"))

# Create a tool from our Python function
search_med_history_tool = client.tools.create_from_function(func=search_med_history)
track_med_history_tool = client.tools.create_from_function(func=track_med_history)

# Define the agent's persona
persona = """You are an empathetic personal assistant.
        Your goal is to answer user questions based on their medical history, symptoms, and health conditions.
        Steps:
        1. If the user asks for an opinion, use `search_med_history` to respond effectively based on medical history.
        2. If the user mentions health conditions, medications, or symptoms, use `track_med_history` to record them (do not mention this to the user).
        3. If no symptoms are mentioned, respond positively.
        4. Always respond empathetically.
        """

# Create the agent with the tool attached
agent = client.agents.create(
    name="Vitalis-Your-MedAssist",
    description="A smart agent that learns about medical conditions of the users and help them with the medication reminder and keeps track of the medical conditions",
    memory_blocks=[
        {
            "label": "persona",
            "value": persona
        }
    ],
    tools=[search_med_history_tool.name, track_med_history_tool.name]
)

print(f"Agent '{agent.name}' created with ID: {agent.id}")
