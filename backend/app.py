from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import os

import util.download_file as download_file
from populate_db import load_documents, split_documents, add_to_chroma
from query import query_rag

load_dotenv()

app = Flask(__name__)
CORS(app)

app.config['AUTH_BEARER'] = os.getenv('AUTH_BEARER')
UPLOAD_FOLDER = '../data/upload'

@app.route('/api/v1/hackrx/run', methods=['POST'])
def hackrx_run():
  # check for authorization header
  auth_header = request.headers.get('Authorization')
  if not auth_header or not auth_header.startswith('Bearer '):
    return jsonify({'error': 'Unauthorized'}), 401
  
  # check for valid token
  token = auth_header.split(' ')[1]
  if token != app.config['AUTH_BEARER']:
    return jsonify({'error': 'Invalid token'}), 403
  
  try:
    data = request.get_json()
    document_url = data.get('documents')
    questions = data.get('questions')

    if not document_url or not questions:
      return jsonify({"error": "Missing fields in request"}), 400
    
    #############################################################
    documents = load_documents()
    chunks = split_documents(documents)
    add_to_chroma(chunks)

    dummy = [query_rag(questions[1])]
    #############################################################

    return jsonify({"answers": dummy}), 200

  except Exception as e:
    return jsonify({"error": str(e)}), 400
  

  
@app.route('/api/upload', methods=['POST'])
def upload_file():
  try:
    if 'files' not in request.files:
      return jsonify({'error': 'No files part in the request'}), 400
    
    files = request.files.getlist('files')
    saved_files = []
    for file in files:
        # Save the file or process it as needed
        file.save(os.path.join(UPLOAD_FOLDER, file.filename))
        saved_files.append(file.filename)

    return jsonify({'uploaded': saved_files}), 200

  except Exception as e:
    return jsonify({'error': str(e)}), 400

  except Exception as e:
      return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
  app.run(debug=True)

