"""
Dictionary Manager for Dynamic Slang Dictionary
Allows users to add/edit/remove slang words via chat interface
"""
import json
import os
from datetime import datetime

class DictionaryManager:
    """Manage dynamic slang dictionary with persistence"""
    
    def __init__(self, dictionary_file='slang_dictionary.json'):
        self.dictionary_file = dictionary_file
        self.dictionary = self._load_dictionary()
    
    def _load_dictionary(self):
        """Load dictionary from JSON file"""
        if os.path.exists(self.dictionary_file):
            try:
                with open(self.dictionary_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    return data.get('dictionary', {})
            except Exception as e:
                print(f"Error loading dictionary: {e}")
                return {}
        else:
            # Create default dictionary
            return self._create_default_dictionary()
    
    def _create_default_dictionary(self):
        """Create default dictionary with common slang"""
        default = {
            # Add some common ones
            'gue': 'saya',
            'gw': 'saya',
            'lo': 'kamu',
            'lu': 'kamu',
            'gk': 'tidak',
            'ga': 'tidak',
            'bgt': 'banget',
            'yg': 'yang',
            'dgn': 'dengan',
            'utk': 'untuk',
            'lg': 'sedang',
            'udah': 'sudah',
            'blm': 'belum',
            'kmrn': 'kemarin',
            'skrg': 'sekarang',
            'gimana': 'bagaimana',
            'emang': 'memang',
            'pengen': 'ingin',
            'tau': 'tahu',
            'aja': 'saja',
        }
        self._save_dictionary(default)
        return default
    
    def _save_dictionary(self, dictionary=None):
        """Save dictionary to JSON file"""
        if dictionary is None:
            dictionary = self.dictionary
        
        data = {
            'dictionary': dictionary,
            'last_updated': datetime.now().isoformat(),
            'total_words': len(dictionary)
        }
        
        try:
            with open(self.dictionary_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            return True
        except Exception as e:
            print(f"Error saving dictionary: {e}")
            return False
    
    def add_word(self, slang, formal):
        """
        Add or update a slang word
        
        Args:
            slang (str): Slang word
            formal (str): Formal equivalent
        
        Returns:
            dict: Result with success status and message
        """
        slang = slang.lower().strip()
        formal = formal.lower().strip()
        
        if not slang or not formal:
            return {
                'success': False,
                'message': '❌ Slang dan formal word tidak boleh kosong!'
            }
        
        # Check if already exists
        is_update = slang in self.dictionary
        old_formal = self.dictionary.get(slang)
        
        # Add/update
        self.dictionary[slang] = formal
        
        # Save to file
        if self._save_dictionary():
            if is_update:
                return {
                    'success': True,
                    'message': f'✅ Updated! "{slang}" → "{formal}" (was: "{old_formal}")',
                    'action': 'updated',
                    'slang': slang,
                    'formal': formal,
                    'old_formal': old_formal
                }
            else:
                return {
                    'success': True,
                    'message': f'🎉 Added! "{slang}" → "{formal}"',
                    'action': 'added',
                    'slang': slang,
                    'formal': formal
                }
        else:
            return {
                'success': False,
                'message': '❌ Gagal menyimpan ke dictionary!'
            }
    
    def remove_word(self, slang):
        """
        Remove a slang word
        
        Args:
            slang (str): Slang word to remove
        
        Returns:
            dict: Result with success status and message
        """
        slang = slang.lower().strip()
        
        if slang not in self.dictionary:
            return {
                'success': False,
                'message': f'❌ Kata "{slang}" tidak ada di dictionary!'
            }
        
        formal = self.dictionary[slang]
        del self.dictionary[slang]
        
        if self._save_dictionary():
            return {
                'success': True,
                'message': f'🗑️ Removed! "{slang}" → "{formal}" dihapus',
                'action': 'removed',
                'slang': slang,
                'formal': formal
            }
        else:
            return {
                'success': False,
                'message': '❌ Gagal menghapus dari dictionary!'
            }
    
    def get_word(self, slang):
        """Get formal word for slang"""
        slang = slang.lower().strip()
        return self.dictionary.get(slang)
    
    def search_words(self, query):
        """
        Search words in dictionary
        
        Args:
            query (str): Search query
        
        Returns:
            list: Matching words
        """
        query = query.lower().strip()
        results = []
        
        for slang, formal in self.dictionary.items():
            if query in slang or query in formal:
                results.append({
                    'slang': slang,
                    'formal': formal
                })
        
        return results
    
    def get_all_words(self):
        """Get all words in dictionary"""
        return [
            {'slang': slang, 'formal': formal}
            for slang, formal in sorted(self.dictionary.items())
        ]
    
    def get_stats(self):
        """Get dictionary statistics"""
        return {
            'total_words': len(self.dictionary),
            'last_updated': datetime.now().isoformat(),
            'file_path': self.dictionary_file,
            'file_exists': os.path.exists(self.dictionary_file)
        }
    
    def export_csv(self):
        """Export dictionary to CSV format"""
        csv_lines = ['slang,formal']
        for slang, formal in sorted(self.dictionary.items()):
            csv_lines.append(f'{slang},{formal}')
        return '\n'.join(csv_lines)
    
    def import_from_dict(self, words_dict):
        """
        Import words from dictionary
        
        Args:
            words_dict (dict): Dictionary of slang -> formal
        
        Returns:
            dict: Import results
        """
        added = 0
        updated = 0
        errors = 0
        
        for slang, formal in words_dict.items():
            try:
                slang = slang.lower().strip()
                formal = formal.lower().strip()
                
                if slang in self.dictionary:
                    updated += 1
                else:
                    added += 1
                
                self.dictionary[slang] = formal
            except:
                errors += 1
        
        self._save_dictionary()
        
        return {
            'success': True,
            'added': added,
            'updated': updated,
            'errors': errors,
            'total': added + updated,
            'message': f'✅ Import complete! Added: {added}, Updated: {updated}'
        }
