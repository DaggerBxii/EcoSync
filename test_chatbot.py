"""
Test script for EcoSync Chatbot functionality
"""

import sys
import os
from pathlib import Path

# Add the backend src directory to the path
backend_src = os.path.join(os.path.dirname(__file__), 'backend', 'src')
sys.path.insert(0, backend_src)

# Import modules directly
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend', 'src'))

from chatbot import chatbot

def test_chatbot():
    """Test the chatbot functionality."""
    print("Testing EcoSync Chatbot...")
    
    # Test initial greeting
    print("\n1. Testing initial greeting:")
    user_id = "test_user_123"
    response = chatbot.process_message(user_id, "Hi")
    print(f"Response: {response['response'][:100]}...")  # Print first 100 chars
    
    # Test requesting a report
    print("\n2. Testing report request:")
    response = chatbot.process_message(user_id, "yes")
    print(f"Report generated: {'graph' in response}")
    print(f"Report data keys: {list(response.get('report_data', {}).keys())}")
    
    # Test efficiency query
    print("\n3. Testing efficiency query:")
    response = chatbot.process_message(user_id, "tell me about efficiency")
    print(f"Efficiency response: {response['response'][:100]}...")
    
    # Test resource reduction tips
    print("\n4. Testing resource reduction tips:")
    response = chatbot.process_message(user_id, "show resource reduction tips")
    print(f"Reduction tips: {response['response'][:100]}...")
    
    # Test general query
    print("\n5. Testing general query:")
    response = chatbot.process_message(user_id, "How can I save energy?")
    print(f"General query response: {response['response'][:100]}...")
    
    # Test efficiency metrics calculation
    print("\n6. Testing efficiency metrics calculation:")
    metrics = chatbot.calculate_resource_efficiency_metrics()
    print(f"Overall building efficiency: {metrics['overall_building_efficiency']}%")
    print(f"Resource types: {list(metrics.keys())}")
    
    print("\nChatbot testing completed successfully!")

if __name__ == "__main__":
    test_chatbot()