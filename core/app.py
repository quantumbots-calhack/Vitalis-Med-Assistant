# Import shared agent configuration
from agent import create_agent, get_prompt

# Create the agent instance
agent = create_agent()

def main():
    print("\nHello! I'm your empathetic personal health assistant.")
    print("You can tell me about your symptoms or ask about your medical history.")
    print("Type 'exit' or 'quit' anytime to end the chat.\n")

    while True:
        user_input = input("You: ").strip()
        if user_input.lower() in ["exit", "quit"]:
            print("\nAssistant: Take care of yourself. Wishing you good health.\n")
            break

        # Use the shared prompt function
        prompt = get_prompt(user_input)

        try:
            result = agent.run(prompt)
            print(f"\nAssistant: {result}\n")
        except Exception as e:
            print(f"\nError: {e}\n")

if __name__ == "__main__":
    main()
