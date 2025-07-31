from fastapi import FastAPI, Request, UploadFile, File, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import asyncio

from populate_db import load_documents, split_documents, add_to_pinecone
from query import query_rag
from util.compute_hash import compute_hash

from pinecone_client import index

load_dotenv()

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

AUTH_BEARER = os.getenv('AUTH_BEARER')
UPLOAD_FOLDER = '../data/upload'

@app.post("/api/v1/hackrx/run")
async def hackrx_run(request: Request):
    # Check for authorization header
    auth_header = request.headers.get('authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    token = auth_header.split(' ')[1]

    # Validate token
    if token != AUTH_BEARER:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid token")

    # Parse request body
    data = await request.json()
    document_url = data.get('documents')
    questions = data.get('questions')

    # Validate required fields
    if not document_url or not questions:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing fields in request")

    # Step 1: Compute document hash to create a unique namespace 
    document_hash = await compute_hash(document_url)
    namespace = f"doc-{document_hash}"

    # Step 2: Check if Pinecone namespace already exists
    existing = await asyncio.to_thread(index.describe_index_stats, namespace=namespace)

    # Step 3: If namespace does not exist, load and process the document
    if existing.get('namespaces', {}).get(namespace, {}).get('vector_count', 0) > 0:
      print(f"[INFO] Document already exists in index under namespace: {namespace}")
    else:
      print(f"[INFO] Document not found in index. Processing and adding to Pinecone under namespace: {namespace}")
      document = await load_documents(document_url)
      chunks = await split_documents(document)
      await add_to_pinecone(chunks, namespace)

    # You can use asyncio for parallel execution if query_rag is async
    response = await asyncio.gather(*(query_rag(q, namespace) for q in questions))

    return JSONResponse(content={"answers": response})

@app.post("/api/upload")
async def upload_file(files: list[UploadFile] = File(...)):
    saved_files = []
    for file in files:
        file_location = os.path.join(UPLOAD_FOLDER, file.filename)
        with open(file_location, "wb") as f:
            f.write(await file.read())
        saved_files.append(file.filename)
    return JSONResponse(content={'uploaded': saved_files})

@app.post("/api/query")
async def query(request: Request):
    data = await request.json()
    query_text = data.get('query')
    if not query_text:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Query text is required")
    # Your mock response here
    response = {
        "id": "result-123",
        "decision": "approved",
        "amount": "10000",
        "justification": f"Query '{query_text}' meets all requirements. Prasanna Ezhilmurugan!!!",
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
    return JSONResponse(content=response)
  
# To run: uvicorn app:app --reload

