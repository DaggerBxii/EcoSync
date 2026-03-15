"""
Comprehensive test script for the new EcoSync Chatbot functionality
"""

import sys
import os
from pathlib import Path

# Add the backend src directory to the path
backend_src = os.path.join(os.path.dirname(__file__), 'backend', 'src')
sys.path.insert(0, backend_src)

from new_chatbot import chatbot
from models import data_store, ResourceType

def test_comprehensive():
    """Run comprehensive tests on the new chatbot functionality."""
    print("Comprehensive Testing of New EcoSync Chatbot...")

    # Test initial greeting
    print("\n1. Testing initial greeting:")
    user_id = "test_user_123"
    response = chatbot.process_message(user_id, "Hi")
    print(f"Response: {response['response'][:150]}...")

    # Test resource control command with correct floor/resource
    print("\n2. Testing water control command on correct floor (floor 1 - cafeteria):")
    response = chatbot.process_message(user_id, "limit water on floor 1 to 60%")
    print(f"Control response: {response['response'][:150]}...")

    # Test HVAC control command
    print("\n3. Testing HVAC control command:")
    response = chatbot.process_message(user_id, "set HVAC on floor 2 to 21°C")
    print(f"HVAC control response: {response['response'][:150]}...")

    # Test lighting control command
    print("\n4. Testing lighting control command:")
    response = chatbot.process_message(user_id, "dim lights on floor 3 to 50%")
    print(f"Lighting control response: {response['response'][:150]}...")

    # Test electricity control command
    print("\n5. Testing electricity control command:")
    response = chatbot.process_message(user_id, "optimize electricity on floor 4")
    print(f"Electricity control response: {response['response'][:150]}...")

    # Test efficiency query
    print("\n6. Testing efficiency query:")
    response = chatbot.process_message(user_id, "How efficient is the building?")
    print(f"Efficiency response: {response['response'][:150]}...")

    # Test energy query
    print("\n7. Testing energy query:")
    response = chatbot.process_message(user_id, "Show me current energy usage")
    print(f"Energy response: {response['response'][:150]}...")

    # Test getting building status
    print("\n8. Testing building status retrieval:")
    status = chatbot.get_building_status(user_id)
    print(f"Building status keys: {list(status.keys())}")
    print(f"Overall efficiency: {status['overall_efficiency']}%")

    # Test user history
    print("\n9. Testing user history:")
    history = chatbot.get_user_history(user_id)
    print(f"History length: {len(history)}")
    for i, msg in enumerate(history[-3:], start=max(len(history)-2, 1)):  # Show last 3 messages
        print(f"  {i}. {msg['role']}: {msg['content'][:50]}...")

    # Test with more complex queries
    print("\n10. Testing complex query:")
    response = chatbot.process_message(user_id, "What are the recommendations to improve building efficiency?")
    print(f"Recommendations response: {response['response'][:150]}...")

    print("\nComprehensive testing completed successfully!")

def show_building_resources():
    """Display the building resources for reference."""
    print("\n" + "="*60)
    print("BUILDING RESOURCE REFERENCE")
    print("="*60)
    
    print(f"Building name: {data_store.building_name}")
    print(f"Total zones: {len(data_store.get_all_zones())}")
    print(f"Total resources: {len(data_store.get_all_resources())}")
    
    print("\nWater resources:")
    water_resources = data_store.get_resources_by_type(ResourceType.WATER)
    for resource in water_resources:
        zone = data_store.get_zone(resource.zone_id)
        floor = zone.floor if zone else 'Unknown'
        print(f"  - {resource.resource_id}: {resource.name} (Floor: {floor})")
    
    print("\nHVAC resources:")
    hvac_resources = data_store.get_resources_by_type(ResourceType.HVAC)
    for resource in hvac_resources[:5]:  # Show first 5
        zone = data_store.get_zone(resource.zone_id)
        floor = zone.floor if zone else 'Unknown'
        print(f"  - {resource.resource_id}: {resource.name} (Floor: {floor})")
    
    print("\nLighting resources:")
    lighting_resources = data_store.get_resources_by_type(ResourceType.LIGHTING)
    for resource in lighting_resources[:5]:  # Show first 5
        zone = data_store.get_zone(resource.zone_id)
        floor = zone.floor if zone else 'Unknown'
        print(f"  - {resource.resource_id}: {resource.name} (Floor: {floor})")
    
    print("\nElectricity resources:")
    electricity_resources = data_store.get_resources_by_type(ResourceType.ELECTRICITY)
    for resource in electricity_resources[:5]:  # Show first 5
        zone = data_store.get_zone(resource.zone_id)
        floor = zone.floor if zone else 'Unknown'
        print(f"  - {resource.resource_id}: {resource.name} (Floor: {floor})")

if __name__ == "__main__":
    show_building_resources()
    test_comprehensive()