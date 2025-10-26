import os
import chromadb
from letta_client import Letta
from dotenv import load_dotenv

load_dotenv()

# Initialize clients
letta_client = Letta(token=os.getenv("LETTA_API_KEY"))
chroma_client = chromadb.CloudClient(
    tenant=os.getenv("CHROMA_TENANT"),
    database=os.getenv("CHROMA_DATABASE"),
    api_key=os.getenv("CHROMA_API_KEY")
)

AGENT_ID = "agent-ed151919-90d2-4029-af6b-cf614898a2d9"

def main():
    while True:
        question = input("\nHey How Can I Help You Today???\n")
        if question.lower() in ['exit', 'quit']:
            break

        # 1. Query ChromaDB
        #collection = chroma_client.get_collection("rag_collection")
        #results = collection.query(query_texts=[question], n_results=3)
        #context = "\n".join(results["documents"][0])

        # 2. Construct the prompt
        prompt = f'''Question: {question}

        Answer:'''

        # 3. Send to Letta Agent
        response = letta_client.agents.messages.create(
            agent_id=AGENT_ID,
            messages=[{"role": "user", "content": prompt}]
        )

        for message in response.messages:
            if message.message_type == 'assistant_message':
                print(f"\nAgent: {message.content}")

if __name__ == "__main__":
    main()

