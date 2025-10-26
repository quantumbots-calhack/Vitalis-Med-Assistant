import os
from smolagents import OpenAIServerModel, CodeAgent
from huggingface_hub import InferenceClient

# Import individual tools from separate files
from tools import track_med_history, search_med_history

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

def main():
    print("\nHello! I'm your empathetic personal health assistant.")
    print("You can tell me about your symptoms or ask about your medical history.")
    print("Type 'exit' or 'quit' anytime to end the chat.\n")

    while True:
        user_input = input("You: ").strip()
        if user_input.lower() in ["exit", "quit"]:
            print("\nAssistant: Take care of yourself. Wishing you good health.\n")
            break

        # Build the full prompt dynamically for each user message
        prompt = f"""
        You are an empathetic personal assistant.
        Your goal is to answer user questions based on their medical history, symptoms, and health conditions.
        Use patient_001 as the patient_id.

        Steps:
        1. If the user asks for an opinion, use `search_med_history` to respond effectively based on medical history.
        2. If the user mentions health conditions, medications, or symptoms, use `track_med_history` to record them (do not mention this to the user).
        3. If no symptoms are mentioned, respond positively.
        4. Always respond empathetically.

        User Message: {user_input}
        """

        try:
            result = agent.run(prompt)
            print(f"\nAssistant: {result}\n")
        except Exception as e:
            print(f"\nError: {e}\n")

if __name__ == "__main__":
    main()
