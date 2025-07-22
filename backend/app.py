from flask import Flask, jsonify, request

app = Flask(__name__)

@app.route('/')
def home():
    return jsonify({"message": "Welcome to the Document Ingestion API"}), 200

@app.route('/upload', methods=['POST'])
def upload():
  if 'file' in request.files:
    file = request.files['file']
    file.save(file.filename)
    return jsonify({"message": "File received", "filename": file.filename}), 200
  elif request.is_json:
    data = request.get_json()
    return jsonify({"message": "JSON data received", "data": data}), 200
  else:
    return jsonify({"error": "No file or JSON data provided"}), 400
  
if __name__ == '__main__':
  app.run(debug=True)