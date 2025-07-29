from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import os

import util.download_file as download_file
from populate_db import load_documents, split_documents, add_to_pinecone
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

    # process the document and add to the database 
    document = load_documents(document_url)
    chunks = split_documents(document)
    add_to_pinecone(chunks)


    # query rag and store the response in a list
    response = []
    for question in questions :
      response.append(query_rag(question))

    return jsonify({"answers": response}), 200

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
  

@app.route('/api/query', methods=['POST'])
def query():
  try:
    data = request.get_json()
    query_text = data.get('query')

    if not query_text:
      return jsonify({'error': 'Query text is required'}), 400

    #######################################
    print(query_text)
    response = {
        "id": "result-123",
        "decision": "approved",
        "amount": "10000",
        "justification": f"Query '{query}' meets all requirements. Prasanna Ezhilmurugan!!!",
        "confidence": 0.92,
        "clauseMappings": [
            {
                "id": "clause-1",
                "clause": "Applicant age is above 18.",
                "section": "Eligibility",
                "relevance": "high",
                "pageNumber": 2,
                "highlighted": True
            },
            {
                "id": "clause-2",
                "clause": "Policy covers the requested amount.",
                "section": "Coverage",
                "relevance": "medium",
                "pageNumber": 5,
                "highlighted": False
            }
        ],
        "details": {
            "policySection": "General Terms",
            "riskAssessment": "Low risk",
            "additionalNotes": "All documents verified."
        }
    }
    #######################################
    return jsonify(response) ,200

  except Exception as e:
    return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
  app.run(debug=True)

