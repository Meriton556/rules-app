from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import sys
import requests
import json
from dotenv import load_dotenv
import pathlib
import threading
import tkinter as tk
from tkinter import filedialog

# Load environment variables
load_dotenv()

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

print(f"Backend starting...")
print(f"Supabase URL: {SUPABASE_URL}")
print(f"Supabase Key exists: {bool(SUPABASE_KEY)}")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: Missing Supabase credentials")
    sys.exit(1)

# Supabase REST API helpers
def supabase_request(method, endpoint, data=None):
    url = f"{SUPABASE_URL}/rest/v1/{endpoint}"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }
    
    print(f"Making {method} request to {url}")
    print(f"Headers: {headers}")
    if data:
        print(f"Data: {json.dumps(data, indent=2)}")
    
    try:
        if method == 'GET':
            response = requests.get(url, headers=headers)
        elif method == 'POST':
            response = requests.post(url, headers=headers, data=json.dumps(data))
        
        print(f"Response status: {response.status_code}")
        print(f"Response body: {response.text}")
        
        if response.status_code >= 400:
            print(f"ERROR: Bad response: {response.status_code} - {response.text}")
            error_body = response.text
            try:
                error_json = response.json()
                if isinstance(error_json, dict) and 'message' in error_json:
                    error_body = error_json['message']
            except:
                pass
            return {"error": f"Supabase API error: {response.status_code} - {error_body}"}, response.status_code
        
        return response.json()
    except Exception as e:
        print(f"Exception in supabase_request: {str(e)}")
        return {"error": f"Request failed: {str(e)}"}, 500

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000", "http://127.0.0.1:3000"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Enable debug mode during development
app.config['DEBUG'] = True

# Root route
@app.route('/', methods=['GET'])
def home():
    return jsonify({
        "status": "online",
        "message": "Rules API is running",
        "endpoints": [
            "/api/rules",
            "/api/categories"
        ]
    })

# Rules endpoints
@app.route('/api/rules', methods=['GET'])
def get_rules():
    try:
        data = supabase_request('GET', 'rules')
        
        # Convert snake_case to camelCase
        if isinstance(data, list):
            for rule in data:
                # Ensure is_official is included
                if 'is_official' in rule:
                    rule['isOfficial'] = rule['is_official']
                    del rule['is_official']
                
                # Ensure is_general is included
                if 'is_general' in rule:
                    rule['isGeneral'] = rule['is_general']
                    del rule['is_general']
                    
                # Convert other fields to camelCase if needed
                if 'best_practices' in rule:
                    rule['bestPractices'] = rule['best_practices']
                    del rule['best_practices']
                    
                if 'author_name' in rule:
                    rule['authorName'] = rule['author_name']
                    del rule['author_name']
                    
                if 'created_at' in rule:
                    rule['createdAt'] = rule['created_at']
                    del rule['created_at']
        
        return jsonify(data)
    except Exception as e:
        print(f"Error getting rules: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/rules', methods=['POST'])
def create_rule():
    try:
        rule_data = request.json
        print("RECEIVED DATA:", json.dumps(rule_data, indent=2))
        
        # Make sure required fields exist
        required_fields = ['content', 'category', 'tags']
        for field in required_fields:
            if field not in rule_data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # If title or description are missing, use category values
        if 'title' not in rule_data or not rule_data['title']:
            rule_data['title'] = rule_data['category']
            
        if 'description' not in rule_data or not rule_data['description']:
            rule_data['description'] = f"Rules for {rule_data['category']}"
        
        # Handle optional bestPractices field
        if 'bestPractices' not in rule_data:
            rule_data['bestPractices'] = ''
        
        # Fix for isOfficial field - manually handle the conversion
        is_official = False
        if 'isOfficial' in rule_data and rule_data['isOfficial']:
            is_official = True
            
        # Fix for isGeneral field - manually handle the conversion
        is_general = False
        if 'isGeneral' in rule_data and rule_data['isGeneral']:
            is_general = True
        
        # Convert camelCase to snake_case for compatibility with database
        converted_data = {}
        for key, value in rule_data.items():
            # Skip isOfficial and isGeneral as we'll add them manually
            if key in ['isOfficial', 'isGeneral']:
                continue
                
            # Convert keys like authorName to author_name
            new_key = ''.join(['_' + c.lower() if c.isupper() else c for c in key]).lstrip('_')
            converted_data[new_key] = value
        
        # Manually add boolean fields
        converted_data['is_official'] = is_official
        converted_data['is_general'] = is_general
        
        print("AFTER CONVERSION:", json.dumps(converted_data, indent=2))
        
        # Make sure tags is a proper array
        if 'tags' in converted_data:
            if not converted_data['tags'] or not isinstance(converted_data['tags'], list):
                converted_data['tags'] = []
                
        # Add any missing fields with default values
        if 'author' not in converted_data or not converted_data['author']:
            converted_data['author'] = 'user'
            
        if 'author_name' not in converted_data or not converted_data['author_name']:
            converted_data['author_name'] = 'User'
            
        if 'count' not in converted_data:
            converted_data['count'] = '+1 rules'
            
        # Make sure we're not clearing author_name even for official rules
        # The front-end will display it based on the isOfficial flag
        
        print("SENDING TO SUPABASE:", json.dumps(converted_data, indent=2))
        
        try:
            response = supabase_request('POST', 'rules', converted_data)
            
            # Check if the response is an error tuple
            if isinstance(response, tuple) and len(response) == 2 and 'error' in response[0]:
                print(f"ERROR FROM SUPABASE: {response[0]}")
                return jsonify(response[0]), response[1]
                
            print("SUPABASE RESPONSE:", response)
            
            if isinstance(response, list) and len(response) > 0:
                return jsonify(response[0]), 201
            return jsonify(response), 201
            
        except Exception as e:
            print(f"SUPABASE ERROR: {str(e)}")
            import traceback
            traceback.print_exc()
            return jsonify({"error": str(e)}), 500
    except Exception as e:
        print(f"GENERAL ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

# New function to show a file save dialog
def show_save_dialog(data):
    """Show a file save dialog and return the chosen path or None if cancelled"""
    try:
        # Prepare filename
        file_name = data['fileName']
        file_name = ''.join(c for c in file_name if c.isalnum() or c in '._- ')
        if not file_name.endswith('.mdc'):
            file_name += '.mdc'
        
        # Create a root window but keep it minimal
        root = tk.Tk()
        root.attributes('-topmost', True)  # Keep dialog on top
        root.withdraw()  # Hide the root window
        
        # Create a simpler initial path - just use Documents folder as default
        home_dir = os.path.expanduser("~")
        docs_dir = os.path.join(home_dir, "Documents")
        if not os.path.exists(docs_dir):
            docs_dir = home_dir
        
        # Show the save file dialog
        file_path = filedialog.asksaveasfilename(
            initialdir=docs_dir,
            initialfile=file_name,
            defaultextension=".mdc",
            filetypes=[("Markdown Content", "*.mdc"), ("All Files", "*.*")]
        )
        
        # Clean up immediately
        root.destroy()
        
        if not file_path:
            print("User cancelled the save operation")
            return None
            
        # If a path was chosen, get the directory
        save_dir = os.path.dirname(file_path)
        
        # Check if this path already contains a cursor/rules structure
        # First check if it's already in a cursor/rules directory
        path_parts = os.path.normpath(save_dir).split(os.sep)
        
        # If the file is already being saved in a cursor/rules directory, just use the original path
        if len(path_parts) >= 2 and path_parts[-2:] == ['cursor', 'rules']:
            print("Already in a cursor/rules directory structure")
            return file_path
        
        # Check if there's a cursor/rules subdirectory
        cursor_rules_path = os.path.join(save_dir, "cursor", "rules")
        
        # Only create the structure if it doesn't exist
        if not os.path.exists(cursor_rules_path):
            try:
                # Create the cursor/rules directory structure
                os.makedirs(cursor_rules_path, exist_ok=True)
                print(f"Created directory structure: {cursor_rules_path}")
            except Exception as e:
                print(f"Failed to create cursor/rules directory: {e}")
                # Continue with the original path if there's an error
                return file_path
        else:
            print(f"Using existing cursor/rules directory: {cursor_rules_path}")
        
        # Always use the cursor/rules path for the file
        new_file_path = os.path.join(cursor_rules_path, os.path.basename(file_path))
        return new_file_path
    except Exception as e:
        print(f"Error in file dialog: {e}")
        import traceback
        traceback.print_exc()
        return None

# New endpoint for saving rules as .mdc files
@app.route('/api/rules/export', methods=['POST'])
def export_rule():
    try:
        data = request.json
        print("EXPORT REQUEST:", json.dumps(data, indent=2))
        
        # Validate required fields
        required_fields = ['content', 'fileName']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Show file dialog to get save path
        file_path = show_save_dialog(data)
        
        # If dialog was cancelled
        if not file_path:
            return jsonify({
                "success": False,
                "message": "Operation cancelled by user"
            })
        
        # Ensure parent directory exists
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        
        # Create metadata content
        metadata = []
        if 'title' in data and data['title']:
            metadata.append(f"# {data['title']}")
        if 'category' in data and data['category']:
            metadata.append(f"Category: {data['category']}")
        if 'authorName' in data and data['authorName']:
            metadata.append(f"Author: {data['authorName']}")
        if 'tags' in data and data['tags'] and isinstance(data['tags'], list):
            metadata.append(f"Tags: {', '.join(data['tags'])}")
        
        metadata.append('\n---\n')
        
        # Combine metadata and content
        content = '\n'.join(metadata) + ('\n' + data['content'] if data['content'] else '')
        
        # Write to file
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        return jsonify({
            "success": True,
            "message": "Rule exported successfully",
            "path": file_path
        })
    except Exception as e:
        print(f"Error exporting rule: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

# Categories endpoints
@app.route('/api/categories', methods=['GET'])
def get_categories():
    try:
        data = supabase_request('GET', 'categories')
        return jsonify(data)
    except Exception as e:
        print(f"Error getting categories: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    # For port conflict resolution
    import socket
    import time
    
    max_attempts = 3
    attempt = 0
    
    while attempt < max_attempts:
        try:
            print(f"Starting Flask server on port 8000...")
            app.run(host="0.0.0.0", port=8000, debug=True)
            break
        except OSError as e:
            attempt += 1
            print(f"Port 8000 is busy. Attempt {attempt}/{max_attempts}. Error: {e}")
            if attempt >= max_attempts:
                print("Could not start server on port 8000. Please free the port and try again.")
                print("To check what's using the port (Windows): netstat -ano | findstr :8000")
                print("To kill the process: taskkill /PID <PID> /F")
                sys.exit(1)
            else:
                time.sleep(2)  # Wait before retrying 