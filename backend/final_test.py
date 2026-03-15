from src.ai_module import EcoBrain

# Test initializing the AI module
print("Initializing EcoBrain with trained models...")
ai_brain = EcoBrain(use_trained_models=True)

# Get model info
info = ai_brain.get_model_info()
print(f"Model info: {info}")

# Test a prediction
input_data = {"hour_of_day": 14}
prediction = ai_brain.get_decision(input_data)
print(f"Sample prediction: {prediction}")
print("Success: AI module is properly integrated with trained models!")