"""
Store patient profile data in ChromaDB for RAG retrieval.
This tool stores onboarding data (basic + medical info) as patient profile.
"""
import os
import json
import chromadb
from datetime import datetime
from dotenv import load_dotenv
from smolagents import tool

load_dotenv()


@tool
def store_patient_profile(
    patient_id: str,
    full_name: str,
    age: int,
    sex: str,
    height_cm: int,
    weight_kg: float,
    allergies: str = "",
    medications: str = "",
    medical_history: str = "",
    email: str = ""
) -> str:
    """
    Store complete patient profile information in ChromaDB for RAG retrieval.
    
    Args:
        patient_id: Unique patient identifier (e.g., user email or ID)
        full_name: Patient's full name
        age: Patient's age
        sex: Patient's sex
        height_cm: Height in centimeters
        weight_kg: Weight in kilograms
        allergies: Known allergies (comma-separated or free text)
        medications: Current medications (comma-separated or free text)
        medical_history: Medical history and conditions
        email: Patient's email address
    
    Returns:
        Confirmation message with stored profile details
    """
    try:
        # Initialize ChromaDB client
        chroma_client = chromadb.CloudClient(
            tenant=os.getenv("CHROMA_TENANT"),
            database=os.getenv("CHROMA_DATABASE"),
            api_key=os.getenv("CHROMA_API_KEY")
        )
        
        # Get or create the health_history collection
        health_collection = chroma_client.get_or_create_collection("health_history")
        
        # Create profile document
        profile_data = {
            "patient_id": patient_id,
            "full_name": full_name,
            "email": email,
            "age": age,
            "sex": sex,
            "height_cm": height_cm,
            "weight_kg": weight_kg,
            "allergies": allergies if allergies else "None known",
            "medications": medications if medications else "None",
            "medical_history": medical_history if medical_history else "No significant history",
            "profile_type": "patient_profile",
            "timestamp": datetime.now().isoformat()
        }
        
        # Store in ChromaDB
        profile_doc = json.dumps(profile_data, indent=2)
        profile_id = f"{patient_id}_profile"
        
        health_collection.add(
            ids=[profile_id],
            documents=[profile_doc],
            metadatas=[{
                "patient_id": patient_id,
                "timestamp": profile_data["timestamp"],
                "source": "onboarding",
                "type": "patient_profile",
                "name": full_name
            }]
        )
        
        return json.dumps({
            "status": "success",
            "message": "Patient profile stored successfully",
            "patient_id": patient_id,
            "profile_data": {
                "name": full_name,
                "email": email,
                "age": age,
                "sex": sex,
                "height_cm": height_cm,
                "weight_kg": weight_kg,
                "allergies": allergies or "None known",
                "medications": medications or "None",
                "medical_history": medical_history or "No significant history"
            }
        }, indent=2)
        
    except Exception as e:
        return json.dumps({
            "status": "error",
            "error": str(e),
            "message": f"Failed to store patient profile: {str(e)}"
        }, indent=2)


@tool
def get_patient_profile(patient_id: str) -> str:
    """
    Retrieve patient profile information from ChromaDB.
    
    Args:
        patient_id: Unique patient identifier
    
    Returns:
        JSON string containing patient profile information
    """
    try:
        # Initialize ChromaDB client
        chroma_client = chromadb.CloudClient(
            tenant=os.getenv("CHROMA_TENANT"),
            database=os.getenv("CHROMA_DATABASE"),
            api_key=os.getenv("CHROMA_API_KEY")
        )
        
        health_collection = chroma_client.get_or_create_collection("health_history")
        
        # Search for patient profile
        profile_id = f"{patient_id}_profile"
        results = health_collection.get(
            ids=[profile_id],
            where={"type": "patient_profile"}
        )
        
        if results['documents'] and len(results['documents']) > 0:
            return results['documents'][0]
        else:
            return json.dumps({
                "status": "not_found",
                "message": f"No profile found for patient: {patient_id}",
                "patient_id": patient_id
            }, indent=2)
            
    except Exception as e:
        return json.dumps({
            "status": "error",
            "error": str(e),
            "message": f"Failed to retrieve patient profile: {str(e)}"
        }, indent=2)

