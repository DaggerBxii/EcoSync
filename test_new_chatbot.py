"""
Test script for the new EcoSync Chatbot functionality
"""

import sys
import os
from pathlib import Path

# Add the backend src directory to the path
backend_src = os.path.join(os.path.dirname(__file__), 'backend', 'src')
sys.path.insert(0, backend_src)

from new_chatbot import chatbot

def test_new_chatbot():
    """Test the new chatbot functionality."""
    print("Testing New EcoSync Chatbot...")

    # Test initial greeting
    print("\n1. Testing initial greeting:")
    user_id = "test_user_123"
    response = chatbot.process_message(user_id, "Hi")
    print(f"Response: {response['response'][:100]}...")  # Print first 100 chars

    # Test resource control command
    print("\n2. Testing resource control command:")
    response = chatbot.process_message(user_id, "limit water on floor 2 to 60%")
    print(f"Control response: {response['response'][:100]}...")

    # Test efficiency query
    print("\n3. Testing efficiency query:")
    response = chatbot.process_message(user_id, "How efficient is the building?")
    print(f"Efficiency response: {response['response'][:100]}...")

    # Test energy query
    print("\n4. Testing energy query:")
    response = chatbot.process_message(user_id, "Show me current energy usage")
    print(f"Energy response: {response['response'][:100]}...")

    # Test getting building status
    print("\n5. Testing building status retrieval:")
    status = chatbot.get_building_status(user_id)
    print(f"Building status keys: {list(status.keys())}")
    print(f"Overall efficiency: {status['overall_efficiency']}%")

    # Test user history
    print("\n6. Testing user history:")
    history = chatbot.get_user_history(user_id)
    print(f"History length: {len(history)}")
    for i, msg in enumerate(history):
        print(f"  {i+1}. {msg['role']}: {msg['content'][:50]}...")

    print("\nNew Chatbot testing completed successfully!")

if __name__ == "__main__":
    test_new_chatbot()