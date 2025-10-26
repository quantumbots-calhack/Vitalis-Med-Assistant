import os
import chromadb
import json
import uuid
from datetime import datetime
from dotenv import load_dotenv
import google.generativeai as genai
from smolagents import tool

load_dotenv()


@tool
def search_med_history(patient_id: str = None) -> str:
    
    """
    Fetches all medical conditions and health history for a specific patient

    Args:
        patient_id (str): The patient ID to fetch history for. Defaults to PATIENT_ID.

    Returns:
        str: JSON string containing all health history with metadata
    """
    try:
        PATIENT_ID = "patient_001"
        print(f"Searching medical history for patient: {patient_id}")
        # Use provided patient_id or default to PATIENT_ID
        target_patient_id = patient_id if patient_id else PATIENT_ID
        
        # Initialize ChromaDB client locally
        chroma_client = chromadb.CloudClient(
            tenant=os.getenv("CHROMA_TENANT"),
            database=os.getenv("CHROMA_DATABASE"),
            api_key=os.getenv("CHROMA_API_KEY")
        )
        
        # Get or create the health_history collection
        health_collection = chroma_client.get_or_create_collection("health_history")
        
        # Get all documents for the patient using get method with where filter
        results = health_collection.get(
            where={"patient_id": target_patient_id}
        )
        
        if results['documents'] and len(results['documents']) > 0:
            # Prepare JSON response with all medical conditions
            search_results = {
                "patient_id": target_patient_id,
                "total_entries": len(results['documents']),
                "medical_conditions": [],
                "summary": {
                    "total_conditions": 0,
                    "total_symptoms": 0,
                    "total_medications": 0,
                    "latest_entry": None,
                    "oldest_entry": None
                }
            }
            
            all_conditions = set()
            all_symptoms = set()
            all_medications = set()
            timestamps = []
            
            # Process each health history entry
            for i, doc in enumerate(results['documents']):
                try:
                    # Parse the JSON document from Gemini analysis
                    health_data = json.loads(doc)
                    
                    entry_item = {
                        "entry_id": results['ids'][i] if results['ids'] else f"entry_{i}",
                        "timestamp": health_data.get('timestamp', 'Unknown'),
                        "conditions": health_data.get('conditions', []),
                        "symptoms": health_data.get('symptoms', []),
                        "medications": health_data.get('medications', []),
                        "metadata": results['metadatas'][i] if results['metadatas'] else {}
                    }
                    
                    search_results["medical_conditions"].append(entry_item)
                    
                    # Collect all unique conditions, symptoms, and medications
                    all_conditions.update(health_data.get('conditions', []))
                    all_symptoms.update(health_data.get('symptoms', []))
                    all_medications.update(health_data.get('medications', []))
                    
                    # Collect timestamps for summary
                    if health_data.get('timestamp'):
                        timestamps.append(health_data['timestamp'])
                        
                except json.JSONDecodeError:
                    # Handle cases where document is not valid JSON
                    entry_item = {
                        "entry_id": results['ids'][i] if results['ids'] else f"entry_{i}",
                        "timestamp": "Unknown",
                        "raw_document": doc,
                        "metadata": results['metadatas'][i] if results['metadatas'] else {}
                    }
                    search_results["medical_conditions"].append(entry_item)
            
            # Update summary with collected data
            search_results["summary"]["total_conditions"] = len(all_conditions)
            search_results["summary"]["total_symptoms"] = len(all_symptoms)
            search_results["summary"]["total_medications"] = len(all_medications)
            search_results["summary"]["all_conditions"] = list(all_conditions)
            search_results["summary"]["all_symptoms"] = list(all_symptoms)
            search_results["summary"]["all_medications"] = list(all_medications)
            
            # Find latest and oldest entries
            if timestamps:
                timestamps.sort()
                search_results["summary"]["oldest_entry"] = timestamps[0]
                search_results["summary"]["latest_entry"] = timestamps[-1]
            
            return json.dumps(search_results, indent=2)
        else:
            # Return empty results in JSON format
            empty_result = {
                "patient_id": target_patient_id,
                "total_entries": 0,
                "medical_conditions": [],
                "summary": {
                    "total_conditions": 0,
                    "total_symptoms": 0,
                    "total_medications": 0,
                    "message": "No health history found for this patient."
                }
            }
            return json.dumps(empty_result, indent=2)
            
    except Exception as e:
        # Return error in JSON format
        error_result = {
            "patient_id": target_patient_id if 'target_patient_id' in locals() else PATIENT_ID,
            "error": f"Error fetching health history: {str(e)}",
            "total_entries": 0,
            "medical_conditions": []
        }
        return json.dumps(error_result, indent=2)


@tool
def track_med_history(patient_info: str, patient_id: str = None) -> str:
    """
    Analyzes patient information using LLM and logs health conditions to ChromaDB

    Args:
        patient_info (str): Patient information or symptoms to analyze
        patient_id (str): The patient ID to track history for. Defaults to PATIENT_ID.

    Returns:
        str: Confirmation message with analyzed health conditions
    """
    try:
        PATIENT_ID = "patient_001"
        patient_id = "patient_001"
        print(f"Searching medical history for patient: {patient_id}")
        # Initialize Gemini AI client locally
        try:
            genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
            model = genai.GenerativeModel('gemini-2.5-flash')
        except Exception as e:
            return f"Error initializing Gemini model: {e}"
        
        # Initialize ChromaDB client locally
        try:
            chroma_client = chromadb.CloudClient(
                tenant=os.getenv("CHROMA_TENANT"),
                database=os.getenv("CHROMA_DATABASE"),
                api_key=os.getenv("CHROMA_API_KEY")
            )
            health_collection = chroma_client.get_or_create_collection("health_history")
        except Exception as e:
            return f"Error initializing ChromaDB: {e}"
        
        # Use LLM to analyze patient information and extract health conditions
        analysis_prompt = f"""You are a medical assistant that analyzes patient information and extracts health conditions in a structured format.

Analyze the following patient information and extract relevant health conditions, symptoms, medications, and medical history.
Return the analysis in a structured JSON format with the following fields:
- conditions: List of identified health conditions
- symptoms: List of symptoms mentioned
- medications: List of medications mentioned
- timestamp: Current timestamp

Patient Information: {patient_info}

Please provide your analysis in valid JSON format:"""
        
        response = model.generate_content(
            analysis_prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.3,
                max_output_tokens=1000,
            )
        )
        
        analysis_result = response.text
        
        # Generate a unique ID for this entry
        entry_id = str(uuid.uuid4())
        timestamp = datetime.now().isoformat()
        
        # Prepare metadata for ChromaDB
        metadata = {
            "patient_id": PATIENT_ID,
            "timestamp": timestamp,
            "source": "patient_input",
            "analysis_type": "health_condition_extraction"
        }
        
        # Store the analysis in ChromaDB
        health_collection.add(
            ids=[entry_id],
            documents=[analysis_result],
            metadatas=[metadata]
        )
        
        # Parse the analysis result to extract key information for response
        try:
            analysis_json = json.loads(analysis_result)
            conditions = analysis_json.get('conditions', [])
            symptoms = analysis_json.get('symptoms', [])
            medications = analysis_json.get('medications', [])
            
            response_text = f"Health conditions logged successfully!\n"
            response_text += f"Identified conditions: {', '.join(conditions) if conditions else 'None identified'}\n"
            response_text += f"Symptoms: {', '.join(symptoms) if symptoms else 'None identified'}\n"
            response_text += f"Medications: {', '.join(medications) if medications else 'None identified'}\n"
            response_text += f"Entry ID: {entry_id}\n"
            response_text += f"Total entries in health history: {health_collection.count()}"
            
        except json.JSONDecodeError:
            response_text = f"Health information logged successfully!\n"
            response_text += f"Analysis: {analysis_result[:200]}...\n"
            response_text += f"Entry ID: {entry_id}\n"
            response_text += f"Total entries in health history: {health_collection.count()}"
        
        return response_text
        
    except Exception as e:
        return f"Error logging health history: {str(e)}"