import sys
from pathlib import Path

# Add the src directory to the path
src_dir = Path(__file__).parent / "src"
sys.path.insert(0, str(src_dir))

from ai_module import EcoBrain

# Test initializing the AI module
print("Initializing EcoBrain with Gemini AI...")
ai_brain = EcoBrain(use_gemini=True)

# Get model info
info = ai_brain.get_model_info()
print(f"Model info: {info}")

# Test a prediction
input_data = {"hour_of_day": 14}
prediction = ai_brain.get_decision(input_data)
print(f"Sample prediction: {prediction}")