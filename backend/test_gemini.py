from src.ai_module import EcoBrain

print("Creating EcoBrain instance...")
ai = EcoBrain()
print("Getting model info...")
info = ai.get_model_info()
print('Model Info:', info)
print('Using Gemini:', info['using_gemini'])
print('Client Initialized:', info['client_initialized'])
print('Model Name:', info['model_name'])

print("\nTesting prediction...")
prediction = ai.get_decision({'hour_of_day': 14})
print('Prediction successful:', 'ai_insight' in prediction)
print('AI Insight sample:', prediction['ai_insight'][:100] + "..." if len(prediction['ai_insight']) > 100 else prediction['ai_insight'])