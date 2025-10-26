#!/usr/bin/env python3
"""
Simple test case for log_history method
One use case: Patient with diabetes symptoms
"""

import os
import sys
from dotenv import load_dotenv

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Load environment variables
load_dotenv()

# Import the functions to test
from tools.history import track_med_history, search_med_history
import json

def test_diabetes_case():
    """Test log_history with a diabetes patient case"""
    print("Testing log_history with Diabetes Patient Case")
    print("=" * 50)
    
    # Test case: Patient with diabetes symptoms
    patient_info = "I have fever"
    
    print(f"Patient Information:")
    print(f"   {patient_info}")
    print()
    
    print("Processing with Gemini AI and storing in ChromaDB...")
    print()
    
    try:
        # Call the log_history function
        result = track_med_history(patient_info)
        
        print("SUCCESS!")
        print("Analysis Result:")
        print(f"   {result}")
        
        # Test search functionality track_med_history search_med_history
        print("\nTesting search_history to fetch all medical conditions...")
        search_result = search_med_history()  # No parameters needed, uses default patient_id
        
        try:
            # Parse JSON to verify format
            search_data = json.loads(search_result)
            print("SUCCESS: Search returned valid JSON!")
            print(f"Patient ID: {search_data.get('patient_id', 'N/A')}")
            print(f"Total Entries: {search_data.get('total_entries', 0)}")
            
            # Display summary information
            summary = search_data.get('summary', {})
            print(f"Total Conditions: {summary.get('total_conditions', 0)}")
            print(f"Total Symptoms: {summary.get('total_symptoms', 0)}")
            print(f"Total Medications: {summary.get('total_medications', 0)}")
            
            if summary.get('all_conditions'):
                print(f"All Conditions: {', '.join(summary['all_conditions'])}")
            
            if search_data.get('medical_conditions'):
                print("Sample Medical Entry:")
                first_entry = search_data['medical_conditions'][0]
                print(f"   Entry ID: {first_entry.get('entry_id', 'N/A')}")
                print(f"   Conditions: {', '.join(first_entry.get('conditions', []))}")
                print(f"   Symptoms: {', '.join(first_entry.get('symptoms', []))}")
                print(f"   Medications: {', '.join(first_entry.get('medications', []))}")
            
        except json.JSONDecodeError as e:
            print(f"ERROR: Search result is not valid JSON: {e}")
            return False
        
        return True
        
    except Exception as e:
        print(f"ERROR: FAILED: {str(e)}")
        return False

if __name__ == "__main__":
    print("Simple Test for log_history Method")
    print("=" * 50)
    
    # Check environment variables
    if not os.getenv("GEMINI_API_KEY"):
        print("ERROR: GEMINI_API_KEY not found in environment")
        print("   Please set your Gemini API key in .env file")
        exit(1)
    
    if not os.getenv("CHROMA_API_KEY"):
        print("ERROR: CHROMA_API_KEY not found in environment")
        print("   Please set your ChromaDB API key in .env file")
        exit(1)
    
    print("SUCCESS: Environment variables found")
    print()
    
    # Run the test
    success = test_diabetes_case()
    
    print()
    print("=" * 50)
    if success:
        print("SUCCESS: Test completed successfully!")
        print("   The log_history method is working correctly.")
    else:
        print("ERROR: Test failed!")
        print("   Please check your API keys and network connection.")
