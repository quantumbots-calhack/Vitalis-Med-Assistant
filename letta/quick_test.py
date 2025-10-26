#!/usr/bin/env python3
"""
Simple integration test for log_history method
Run this script to quickly test the log_history functionality
"""

import os
import sys
from dotenv import load_dotenv

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Load environment variables
load_dotenv()

def quick_test():
    """Quick test of track_med_history functionality"""
    print("Quick Test of track_med_history Method")
    print("=" * 40)
    
    # Check if we can import the function
    try:
        from tools.history import track_med_history, search_med_history
        print("SUCCESS: Successfully imported track_med_history and search_med_history")
    except ImportError as e:
        print(f"ERROR: Import failed: {e}")
        return False
    
    # Check environment variables
    required_vars = ["GEMINI_API_KEY", "CHROMA_API_KEY", "CHROMA_TENANT", "CHROMA_DATABASE"]
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    
    if missing_vars:
        print(f"WARNING: Missing environment variables: {', '.join(missing_vars)}")
        print("   Some tests may fail without proper API keys")
    else:
        print("SUCCESS: All environment variables are set")
    
    # Test with a simple case
    test_input = "Patient has headache and fever for 2 days"
    
    print(f"\nTesting with input: '{test_input}'")
    print("Processing...")
    
    try:
        result = track_med_history(test_input)
        print(f"SUCCESS! Result:\n{result}")
        
        # Test search functionality
        print(f"\nTesting search to fetch all medical conditions...")
        search_result = search_med_history()
        print(f"SUCCESS: Search result: {search_result}")
        
        return True
        
    except Exception as e:
        print(f"ERROR: Test failed: {str(e)}")
        return False

if __name__ == "__main__":
    success = quick_test()
    
    print("\n" + "=" * 40)
    if success:
        print("SUCCESS: Quick test completed successfully!")
        print("\nTo run comprehensive tests:")
        print("  python test_log_history.py")
        print("  python test_log_history_unit.py")
    else:
        print("ERROR: Quick test failed!")
        print("\nPlease check:")
        print("  1. Environment variables are set correctly")
        print("  2. Required packages are installed")
        print("  3. API keys are valid")
