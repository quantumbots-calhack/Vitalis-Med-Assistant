import os
from smolagents import OpenAIServerModel, CodeAgent, tool, ChatMessage

from huggingface_hub import InferenceClient

# Import individual tools from separate files
from tools import track_med_history, search_med_history

model = OpenAIServerModel(
      model_id="gemini-2.0-flash",
      # Google Gemini OpenAI-compatible API base URL
      api_base="https://generativelanguage.googleapis.com/v1beta/openai/",
      api_key=os.getenv("gemini_key"),
)

# --- Agent Setup ---
agent = CodeAgent(
    tools=[track_med_history, search_med_history],
    model=model,
    add_base_tools=True,
    max_steps=5
)

# result = agent.run(
#     "I have fever",
# )
# print(result)

def main():
    return

        

if __name__ == "__main__":
    
    #PATIENT_ID = "patient_001"
    question = input("\nHey How Can I Help You Today???\n")
    prompt = """You are a Empathetic personal assistant. 
             
             Your goal is to answer questions by users based on his medical history, 
             symptoms and health conditons. use patient_001 for patient_id
             Steps :
             1. If user asks opinion refer the `search_med_history` tool to respond user queries effectively based on medical history
             2. If user mentions health conditions / medications / symptomps  then use `track_med_history` to track. Don't repeat this process
             3. Don't mention that you're tracking record. If no symptomps respond postive
             4. Respond Empathetic
             User Message:
             """ + question

    result = agent.run(prompt)
    print(result)