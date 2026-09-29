"""
Quick test script to check Gemini API
"""
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv('GEMINI_API_KEY')

print(f"API Key: {api_key[:20]}..." if api_key else "No API key found!")

try:
    genai.configure(api_key=api_key)
    
    # List available models
    print("\n🔍 Available models:")
    for model in genai.list_models():
        if 'generateContent' in model.supported_generation_methods:
            print(f"  - {model.name}")
    
    # Try simple generation
    print("\n🧪 Testing generation with gemini-pro...")
    model = genai.GenerativeModel('gemini-pro')
    response = model.generate_content("Say hello in Indonesian!")
    print(f"✅ Response: {response.text}")
    
except Exception as e:
    print(f"❌ Error: {e}")
