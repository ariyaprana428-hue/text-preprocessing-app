"""
Flask REST API for Text Preprocessing
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import AutoTokenizer
from preprocessing import TraditionalPreprocessor, IndoBERTPreprocessor
from dictionary_manager import DictionaryManager
from gemini_chat import GeminiChat
import os
import json
import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for frontend requests

# Initialize preprocessors
traditional_preprocessor = TraditionalPreprocessor()

# Initialize dictionary manager
dictionary_manager = DictionaryManager()

# Initialize Gemini AI Chat
gemini_chat = GeminiChat()

# Load IndoBERT tokenizer (will download on first run)
print("Loading IndoBERT tokenizer...")
try:
    indobert_tokenizer = AutoTokenizer.from_pretrained("indobenchmark/indobert-base-p1")
    indobert_preprocessor = IndoBERTPreprocessor(indobert_tokenizer)
    print("IndoBERT tokenizer loaded successfully!")
except Exception as e:
    print(f"Error loading IndoBERT tokenizer: {e}")
    indobert_preprocessor = None


@app.route('/')
def home():
    """Home endpoint"""
    return jsonify({
        'message': 'Text Preprocessing API',
        'version': '1.0.0',
        'endpoints': {
            'traditional': '/api/preprocess/traditional',
            'indobert': '/api/preprocess/indobert',
            'health': '/api/health'
        }
    })


@app.route('/api/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'indobert_loaded': indobert_preprocessor is not None
    })


@app.route('/api/preprocess/traditional', methods=['POST'])
def traditional_preprocess():
    """
    Traditional preprocessing endpoint
    
    Expected JSON:
    {
        "text": "Text to preprocess",
        "options": {
            "lowercase": true,
            "remove_punctuation": true,
            "remove_numbers": true,
            "remove_stopwords": true,
            "stemming": true
        }
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({
                'error': 'Text is required'
            }), 400
        
        text = data['text']
        options = data.get('options', {})
        
        # Default options if not provided
        default_options = {
            'normalize_slang': True,
            'lowercase': True,
            'remove_punctuation': True,
            'remove_numbers': True,
            'remove_stopwords': True,
            'stemming': True
        }
        
        # Merge with provided options
        preprocessing_options = {**default_options, **options}
        
        # Preprocess text
        result = traditional_preprocessor.preprocess(text, preprocessing_options)
        
        return jsonify({
            'success': True,
            'method': 'traditional',
            'result': result
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/preprocess/indobert', methods=['POST'])
def indobert_preprocess():
    """
    IndoBERT tokenization endpoint
    
    Expected JSON:
    {
        "text": "Text to tokenize",
        "max_length": 512  // optional
    }
    """
    try:
        if indobert_preprocessor is None:
            return jsonify({
                'success': False,
                'error': 'IndoBERT tokenizer not loaded'
            }), 503
        
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({
                'error': 'Text is required'
            }), 400
        
        text = data['text']
        max_length = data.get('max_length', 512)
        
        # Tokenize with IndoBERT
        result = indobert_preprocessor.tokenize(text, max_length)
        
        return jsonify({
            'success': True,
            'method': 'indobert',
            'result': result
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/preprocess/both', methods=['POST'])
def both_preprocess():
    """
    Apply both traditional and IndoBERT preprocessing
    
    Expected JSON:
    {
        "text": "Text to preprocess",
        "traditional_options": {
            "lowercase": true,
            "remove_punctuation": true,
            "remove_numbers": true,
            "remove_stopwords": true,
            "stemming": true
        },
        "max_length": 512  // optional for IndoBERT
    }
    """
    try:
        if indobert_preprocessor is None:
            return jsonify({
                'success': False,
                'error': 'IndoBERT tokenizer not loaded'
            }), 503
        
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({
                'error': 'Text is required'
            }), 400
        
        text = data['text']
        traditional_options = data.get('traditional_options', {
            'lowercase': True,
            'remove_punctuation': True,
            'remove_numbers': True,
            'remove_stopwords': True,
            'stemming': True
        })
        max_length = data.get('max_length', 512)
        
        # Apply traditional preprocessing
        traditional_result = traditional_preprocessor.preprocess(text, traditional_options)
        
        # Apply IndoBERT tokenization to original text
        indobert_result = indobert_preprocessor.tokenize(text, max_length)
        
        # Also tokenize preprocessed text
        indobert_preprocessed_result = indobert_preprocessor.tokenize(
            traditional_result['processed_text'], 
            max_length
        )
        
        return jsonify({
            'success': True,
            'method': 'both',
            'result': {
                'traditional': traditional_result,
                'indobert_original': indobert_result,
                'indobert_preprocessed': indobert_preprocessed_result
            }
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500





# ============= GEMINI AI CHAT API =============

@app.route('/api/chat/ai', methods=['POST'])
def ai_chat():
    """
    Chat with Gemini AI
    
    Expected JSON:
    {
        "message": "User message",
        "context": {} // optional
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'message' not in data:
            return jsonify({
                'success': False,
                'error': 'Message is required'
            }), 400
        
        message = data['message']
        context = data.get('context', None)
        
        # Send to Gemini
        response = gemini_chat.send_message(message, context)
        
        return jsonify(response)
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'fallback_to_rules': True
        }), 500


@app.route('/api/chat/ai/status', methods=['GET'])
def ai_chat_status():
    """Get AI chat availability status"""
    try:
        info = gemini_chat.get_info()
        return jsonify({
            'success': True,
            'ai_available': gemini_chat.is_available(),
            'info': info
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/chat/ai/reset', methods=['POST'])
def ai_chat_reset():
    """Reset AI conversation history"""
    try:
        result = gemini_chat.reset_conversation()
        return jsonify(result)
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


# ============= DICTIONARY MANAGEMENT API =============

@app.route('/api/dictionary/list', methods=['GET'])
def get_dictionary():
    """Get words in dictionary with pagination"""
    try:
        # Get pagination parameters
        page = request.args.get('page', 1, type=int)
        page_size = request.args.get('page_size', 50, type=int)
        
        # Get all words
        all_words = dictionary_manager.get_all_words()
        stats = dictionary_manager.get_stats()
        
        # Calculate pagination
        total_words = len(all_words)
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        
        # Get paginated words
        paginated_words = all_words[start_idx:end_idx]
        
        return jsonify({
            'success': True,
            'words': paginated_words,
            'stats': stats,
            'pagination': {
                'page': page,
                'page_size': page_size,
                'total_words': total_words,
                'has_more': end_idx < total_words
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/dictionary/add', methods=['POST'])
def add_word():
    """Add or update a word in dictionary"""
    try:
        data = request.get_json()
        
        if not data or 'slang' not in data or 'formal' not in data:
            return jsonify({
                'success': False,
                'message': '❌ Slang dan formal word harus diisi!'
            }), 400
        
        slang = data['slang']
        formal = data['formal']
        
        result = dictionary_manager.add_word(slang, formal)
        
        # Reload normalizer's dictionary from JSON file
        traditional_preprocessor.slang_normalizer.reload_dictionary()
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': '❌ Terjadi error saat menambahkan kata!'
        }), 500


@app.route('/api/dictionary/remove', methods=['POST'])
def remove_word():
    """Remove a word from dictionary"""
    try:
        data = request.get_json()
        
        if not data or 'slang' not in data:
            return jsonify({
                'success': False,
                'message': '❌ Slang word harus diisi!'
            }), 400
        
        slang = data['slang']
        result = dictionary_manager.remove_word(slang)
        
        # Reload normalizer's dictionary from JSON file
        traditional_preprocessor.slang_normalizer.reload_dictionary()
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': '❌ Terjadi error saat menghapus kata!'
        }), 500


@app.route('/api/dictionary/search', methods=['POST'])
def search_dictionary():
    """Search words in dictionary"""
    try:
        data = request.get_json()
        
        if not data or 'query' not in data:
            return jsonify({
                'success': False,
                'message': '❌ Query harus diisi!'
            }), 400
        
        query = data['query']
        results = dictionary_manager.search_words(query)
        
        return jsonify({
            'success': True,
            'results': results,
            'count': len(results)
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/dictionary/import', methods=['POST'])
def import_dictionary():
    """Import multiple words from CSV data (supports 2 or 3 columns)"""
    try:
        data = request.get_json()
        
        if not data or 'csv_data' not in data:
            return jsonify({
                'success': False,
                'message': '❌ CSV data required!'
            }), 400
        
        csv_data = data['csv_data']
        
        # Parse CSV
        import csv
        import io
        
        # Try to detect CSV structure
        sample_line = csv_data.split('\n')[0] if csv_data else ''
        has_context = 'context' in sample_line.lower() or sample_line.count(',') >= 2
        
        reader = csv.DictReader(io.StringIO(csv_data))
        
        added_count = 0
        updated_count = 0
        skipped_count = 0
        errors = []
        
        for row_num, row in enumerate(reader, start=2):  # Start at 2 (after header)
            # Handle both 2-column and 3-column CSV formats
            slang = row.get('slang', '').strip() if 'slang' in row else ''
            formal = row.get('formal', '').strip() if 'formal' in row else ''
            
            # If columns not found by name, try by position
            if not slang and not formal:
                row_values = list(row.values())
                if len(row_values) >= 2:
                    slang = row_values[0].strip()
                    formal = row_values[1].strip()
            
            # Validate
            if not slang or not formal:
                skipped_count += 1
                if not slang and not formal:
                    continue  # Skip silently if completely empty
                errors.append(f"Row {row_num}: Missing slang or formal")
                continue
            
            try:
                result = dictionary_manager.add_word(slang, formal)
                if 'updated' in result.get('message', '').lower():
                    updated_count += 1
                else:
                    added_count += 1
            except Exception as e:
                errors.append(f"Row {row_num} ('{slang}'): {str(e)}")
                skipped_count += 1
        
        # Reload normalizer's dictionary once after all imports
        traditional_preprocessor.slang_normalizer.reload_dictionary()
        
        total_processed = added_count + updated_count + skipped_count
        
        message = f"✅ Import selesai!\n\n"
        message += f"📥 Added: {added_count} new words\n"
        message += f"🔄 Updated: {updated_count} existing words\n"
        message += f"⚠️ Skipped: {skipped_count} rows (empty/duplicate/error)\n"
        message += f"📊 Total rows processed: {total_processed}"
        
        if has_context:
            message += f"\n\n💡 Note: Context column detected but not stored (only slang → formal mapping)"
        
        if errors and len(errors) <= 5:
            message += f"\n\n❌ Errors:\n" + "\n".join(errors)
        elif errors:
            message += f"\n\n❌ {len(errors)} errors occurred (showing first 5):\n" + "\n".join(errors[:5])
        
        return jsonify({
            'success': True,
            'message': message,
            'added': added_count,
            'updated': updated_count,
            'skipped': skipped_count,
            'total_processed': total_processed,
            'has_context_column': has_context,
            'errors': errors[:10]  # Only return first 10 errors
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': '❌ Import failed!'
        }), 500


@app.route('/api/dictionary/suggest', methods=['POST'])
def suggest_formal_word():
    """Use AI to suggest formal word for slang"""
    try:
        data = request.get_json()
        
        if not data or 'slang' not in data:
            return jsonify({
                'success': False,
                'message': '❌ Slang word harus diisi!'
            }), 400
        
        slang = data['slang']
        context = data.get('context', '')
        
        # Use AI to predict formal word
        predicted, confidence = traditional_preprocessor.slang_normalizer.predict_formal_word(slang, context)
        
        return jsonify({
            'success': True,
            'slang': slang,
            'suggested': predicted,
            'confidence': confidence,
            'message': f'🤖 AI suggests: "{predicted}" (confidence: {confidence}%)'
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': '❌ AI suggestion failed!'
        }), 500


@app.route('/api/dictionary/export', methods=['GET'])
def export_dictionary():
    """Export dictionary as CSV"""
    try:
        csv_content = dictionary_manager.export_csv()
        
        return jsonify({
            'success': True,
            'csv': csv_content,
            'filename': 'slang_dictionary.csv'
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/dictionary/stats', methods=['GET'])
def get_dictionary_stats():
    """Get dictionary statistics"""
    try:
        stats = dictionary_manager.get_stats()
        
        return jsonify({
            'success': True,
            'stats': stats
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)



# ============= CHAT TRAINING API =============

# Simple conversation learning storage
chat_patterns_file = 'chat_patterns.json'

def load_chat_patterns():
    """Load learned chat patterns"""
    try:
        if os.path.exists(chat_patterns_file):
            with open(chat_patterns_file, 'r', encoding='utf-8') as f:
                return json.load(f)
    except:
        pass
    return {}

def save_chat_patterns(patterns):
    """Save learned chat patterns"""
    try:
        with open(chat_patterns_file, 'w', encoding='utf-8') as f:
            json.dump(patterns, f, indent=2, ensure_ascii=False)
        return True
    except:
        return False

@app.route('/api/chat/train', methods=['POST'])
def train_chat():
    """
    Train rule-based chat with new patterns
    
    Expected JSON:
    {
        "pattern": "user input pattern",
        "response": "bot response",
        "keywords": ["keyword1", "keyword2"]  // optional
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'pattern' not in data or 'response' not in data:
            return jsonify({
                'success': False,
                'message': '❌ Pattern and response required!'
            }), 400
        
        pattern = data['pattern'].strip().lower()
        response = data['response'].strip()
        keywords = data.get('keywords', [])
        
        if not pattern or not response:
            return jsonify({
                'success': False,
                'message': '❌ Pattern and response cannot be empty!'
            }), 400
        
        # Load existing patterns
        patterns = load_chat_patterns()
        
        # Add new pattern
        pattern_id = f"pattern_{len(patterns) + 1}"
        patterns[pattern_id] = {
            'pattern': pattern,
            'response': response,
            'keywords': keywords if keywords else [word for word in pattern.split() if len(word) > 3],
            'created_at': datetime.datetime.now().isoformat(),
            'used_count': 0
        }
        
        # Save patterns
        if save_chat_patterns(patterns):
            return jsonify({
                'success': True,
                'message': '✅ Bot berhasil belajar pattern baru!',
                'pattern_id': pattern_id,
                'total_patterns': len(patterns)
            })
        else:
            return jsonify({
                'success': False,
                'message': '❌ Failed to save pattern!'
            }), 500
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': '❌ Training failed!'
        }), 500


@app.route('/api/chat/patterns', methods=['GET'])
def get_chat_patterns():
    """Get all learned patterns"""
    try:
        patterns = load_chat_patterns()
        
        return jsonify({
            'success': True,
            'patterns': patterns,
            'total': len(patterns)
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/chat/match', methods=['POST'])
def match_chat_pattern():
    """
    Match user message against learned patterns
    
    Expected JSON:
    {
        "message": "user message"
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'message' not in data:
            return jsonify({
                'success': False,
                'message': '❌ Message required!'
            }), 400
        
        message = data['message'].strip().lower()
        patterns = load_chat_patterns()
        
        # Find matching pattern
        best_match = None
        best_score = 0
        
        for pattern_id, pattern_data in patterns.items():
            # Calculate match score based on keywords
            score = 0
            for keyword in pattern_data['keywords']:
                if keyword.lower() in message:
                    score += 1
            
            # Also check if pattern itself is in message
            if pattern_data['pattern'] in message:
                score += 5
            
            if score > best_score:
                best_score = score
                best_match = pattern_data
                best_match['pattern_id'] = pattern_id
        
        if best_match and best_score > 0:
            # Update usage count
            patterns[best_match['pattern_id']]['used_count'] += 1
            save_chat_patterns(patterns)
            
            return jsonify({
                'success': True,
                'matched': True,
                'response': best_match['response'],
                'pattern': best_match['pattern'],
                'score': best_score
            })
        else:
            return jsonify({
                'success': True,
                'matched': False,
                'message': 'No matching pattern found'
            })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/chat/pattern/<pattern_id>', methods=['DELETE'])
def delete_chat_pattern(pattern_id):
    """Delete a learned pattern"""
    try:
        patterns = load_chat_patterns()
        
        if pattern_id in patterns:
            del patterns[pattern_id]
            save_chat_patterns(patterns)
            
            return jsonify({
                'success': True,
                'message': '✅ Pattern deleted!',
                'total_patterns': len(patterns)
            })
        else:
            return jsonify({
                'success': False,
                'message': '❌ Pattern not found!'
            }), 404
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
