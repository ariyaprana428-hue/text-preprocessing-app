"""
Google Gemini AI Chat Integration
Smart conversational AI for dictionary assistant
"""
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

class GeminiChat:
    """Google Gemini AI Chat Handler"""
    
    def __init__(self):
        self.api_key = os.getenv('GEMINI_API_KEY', '')
        self.model = None
        self.chat = None
        self.enabled = False
        
        # System instruction for dictionary assistant
        self.system_instruction = """
You are a friendly Dictionary Assistant chatbot for an Indonesian text preprocessing application.

Your personality:
- Friendly and casual (use "aku" and "kamu")
- Helpful and encouraging
- Fun and can tell jokes
- Empathetic and supportive
- Use emojis appropriately 😊

Your main responsibilities:
1. Help users add new slang words to the dictionary
2. Search for words in the dictionary
3. Provide information about the application
4. Have casual friendly conversations
5. Guide users through using the app features

Key features of the app:
- AI-enhanced text preprocessing using IndoBERT
- Slang normalization (e.g., "gue" → "saya", "gk" → "tidak")
- Traditional preprocessing (lowercase, stopwords, stemming)
- IndoBERT tokenization
- Dynamic dictionary management

When users want to:
- Add words: Guide them step by step
- Search: Help them find words
- Learn about AI: Explain IndoBERT and preprocessing
- Chat casually: Be friendly and engaging!

Always respond in Indonesian, be concise but friendly, and use emojis naturally.
If users ask about topics outside dictionary/preprocessing, be helpful but gently redirect to app features.
"""
        
        self._initialize()
    
    def _initialize(self):
        """Initialize Gemini AI"""
        if not self.api_key or self.api_key == 'your_gemini_api_key_here':
            print("⚠️  Gemini API key not set. AI chat will be disabled.")
            print("   Get free API key at: https://aistudio.google.com/app/apikey")
            self.enabled = False
            return
        
        try:
            # Configure API
            genai.configure(api_key=self.api_key)
            
            # Create model with system instruction - using gemini-3.1-flash-lite
            self.model = genai.GenerativeModel(
                'gemini-3.1-flash-lite-preview',  # Lighter model, higher quota
                system_instruction=self.system_instruction
            )
            
            # Start chat session
            self.chat = self.model.start_chat(history=[])
            
            self.enabled = True
            print("✓ Gemini AI chat initialized with gemini-3.1-flash-lite!")
            
        except Exception as e:
            print(f"⚠️  Error initializing Gemini: {e}")
            print("   AI chat will be disabled. Using rule-based fallback.")
            self.enabled = False
    
    def send_message(self, user_message, context=None):
        """
        Send message to Gemini and get response
        
        Args:
            user_message (str): User's message
            context (dict): Optional context (conversation history, etc.)
        
        Returns:
            dict: Response with text and metadata
        """
        if not self.enabled:
            return {
                'success': False,
                'error': 'Gemini AI not available',
                'fallback_to_rules': True
            }
        
        try:
            # Send message through chat
            response = self.chat.send_message(user_message)
            
            return {
                'success': True,
                'reply': response.text,
                'model': 'gemini-3.1-flash-lite',
                'ai_powered': True
            }
            
        except Exception as e:
            print(f"Gemini API error: {e}")
            return {
                'success': False,
                'error': str(e),
                'fallback_to_rules': True
            }
    
    def reset_conversation(self):
        """Reset chat history"""
        if self.enabled and self.model:
            try:
                self.chat = self.model.start_chat(history=[])
                return {'success': True, 'message': 'Conversation reset'}
            except Exception as e:
                return {'success': False, 'message': f'Error: {e}'}
        return {'success': False, 'message': 'AI not available'}
    
    def is_available(self):
        """Check if Gemini AI is available"""
        return self.enabled
    
    def get_info(self):
        """Get information about AI status"""
        return {
            'enabled': self.enabled,
            'model': 'gemini-3.1-flash-lite' if self.enabled else None,
            'provider': 'Google Gemini',
            'features': [
                'Natural conversation',
                'Context awareness',
                'Indonesian language support',
                'Personality & empathy'
            ]
        }
