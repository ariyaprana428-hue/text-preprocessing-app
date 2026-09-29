"""
Preprocessing utilities for Indonesian text
"""
import re
import string
from Sastrawi.Stemmer.StemmerFactory import StemmerFactory
from Sastrawi.StopWordRemover.StopWordRemoverFactory import StopWordRemoverFactory
from slang_normalizer import SlangNormalizer

class TraditionalPreprocessor:
    """Traditional text preprocessing for Indonesian language"""
    
    def __init__(self):
        # Initialize Sastrawi stemmer
        self.stemmer_factory = StemmerFactory()
        self.stemmer = self.stemmer_factory.create_stemmer()
        
        # Initialize stopword remover
        self.stopword_factory = StopWordRemoverFactory()
        self.stopword_remover = self.stopword_factory.create_stop_word_remover()
        
        # Get stopword list
        self.stopwords = self.stopword_factory.get_stop_words()
        
        # Initialize slang normalizer
        self.slang_normalizer = SlangNormalizer()
    
    def normalize_slang(self, text):
        """Normalize Indonesian slang and abbreviations with AI enhancement"""
        normalized_text, _ = self.slang_normalizer.normalize(text, preserve_case=False, include_ai=True)
        return normalized_text
    
    def normalize_slang_with_details(self, text):
        """Normalize with AI details"""
        return self.slang_normalizer.normalize_with_ai_details(text)
    
    def to_lowercase(self, text):
        """Convert text to lowercase"""
        return text.lower()
    
    def remove_punctuation(self, text):
        """Remove punctuation from text"""
        return text.translate(str.maketrans('', '', string.punctuation))
    
    def remove_numbers(self, text):
        """Remove numbers from text"""
        return re.sub(r'\d+', '', text)
    
    def normalize_whitespace(self, text):
        """Normalize whitespace (remove extra spaces)"""
        return ' '.join(text.split())
    
    def remove_stopwords(self, text):
        """Remove Indonesian stopwords"""
        words = text.split()
        filtered_words = [word for word in words if word not in self.stopwords]
        return ' '.join(filtered_words)
    
    def stem_text(self, text):
        """Apply stemming to text"""
        return self.stemmer.stem(text)
    
    def preprocess(self, text, options):
        """
        Apply preprocessing based on selected options
        
        Args:
            text (str): Input text
            options (dict): Dictionary of preprocessing options
                - normalize_slang: bool
                - lowercase: bool
                - remove_punctuation: bool
                - remove_numbers: bool
                - remove_stopwords: bool
                - stemming: bool
        
        Returns:
            dict: Dictionary containing processed text and statistics
        """
        original_text = text
        original_word_count = len(text.split())
        
        steps = []
        slang_info = None
        ai_info = None
        
        # Normalize slang first (before other preprocessing)
        if options.get('normalize_slang', False):
            # Get detailed AI normalization info
            ai_normalization = self.normalize_slang_with_details(text)
            text = ai_normalization['normalized_text']
            
            slang_count = ai_normalization['total_normalized']
            
            steps.append('Slang normalization (AI-Enhanced)')
            
            slang_info = {
                'slang_count': slang_count,
                'dictionary_count': ai_normalization['dictionary_count'],
                'ai_predicted_count': ai_normalization['ai_predicted_count'],
                'details': ai_normalization['details']
            }
            
            ai_info = {
                'ai_enabled': ai_normalization['ai_enabled'],
                'model': 'IndoBERT',
                'method': 'Hybrid (Dictionary + AI Confidence Scoring)',
                'total_normalized': slang_count
            }
        
        # Apply preprocessing steps based on options
        if options.get('lowercase', False):
            text = self.to_lowercase(text)
            steps.append('Case folding (lowercase)')
        
        if options.get('remove_punctuation', False):
            text = self.remove_punctuation(text)
            steps.append('Punctuation removal')
        
        if options.get('remove_numbers', False):
            text = self.remove_numbers(text)
            steps.append('Number removal')
        
        # Always normalize whitespace after removals
        text = self.normalize_whitespace(text)
        
        if options.get('remove_stopwords', False):
            text = self.remove_stopwords(text)
            steps.append('Stopword removal')
            text = self.normalize_whitespace(text)
        
        if options.get('stemming', False):
            text = self.stem_text(text)
            steps.append('Stemming')
        
        # Final whitespace normalization
        text = self.normalize_whitespace(text)
        
        processed_word_count = len(text.split()) if text else 0
        
        result = {
            'original_text': original_text,
            'processed_text': text,
            'steps_applied': steps,
            'statistics': {
                'original_word_count': original_word_count,
                'processed_word_count': processed_word_count,
                'words_removed': original_word_count - processed_word_count,
                'original_char_count': len(original_text),
                'processed_char_count': len(text)
            }
        }
        
        # Add slang info if normalization was applied
        if slang_info:
            result['slang_info'] = slang_info
        
        # Add AI info if AI was used
        if ai_info:
            result['ai_info'] = ai_info
        
        return result


class IndoBERTPreprocessor:
    """IndoBERT tokenization and preprocessing"""
    
    def __init__(self, tokenizer):
        self.tokenizer = tokenizer
    
    def tokenize(self, text, max_length=512):
        """
        Tokenize text using IndoBERT tokenizer
        
        Args:
            text (str): Input text
            max_length (int): Maximum sequence length
        
        Returns:
            dict: Dictionary containing tokenization results
        """
        # Tokenize with IndoBERT
        encoding = self.tokenizer(
            text,
            add_special_tokens=True,
            max_length=max_length,
            padding='max_length',
            truncation=True,
            return_tensors='pt'
        )
        
        # Get tokens (convert IDs back to tokens)
        tokens = self.tokenizer.convert_ids_to_tokens(encoding['input_ids'][0])
        
        # Get token IDs
        token_ids = encoding['input_ids'][0].tolist()
        
        # Get attention mask
        attention_mask = encoding['attention_mask'][0].tolist()
        
        # Filter out padding tokens for display
        valid_tokens = []
        valid_token_ids = []
        for token, token_id, mask in zip(tokens, token_ids, attention_mask):
            if mask == 1:  # Only include non-padded tokens
                valid_tokens.append(token)
                valid_token_ids.append(token_id)
        
        return {
            'original_text': text,
            'tokens': valid_tokens,
            'token_ids': valid_token_ids,
            'attention_mask': attention_mask,
            'statistics': {
                'total_tokens': len(valid_tokens),
                'sequence_length': max_length,
                'actual_length': len(valid_tokens),
                'padding_tokens': max_length - len(valid_tokens)
            },
            'special_tokens': {
                'cls_token': self.tokenizer.cls_token,
                'sep_token': self.tokenizer.sep_token,
                'pad_token': self.tokenizer.pad_token,
                'unk_token': self.tokenizer.unk_token
            }
        }
