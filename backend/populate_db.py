from langchain_community.document_loaders.pdf import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain.schema import Document
# from langchain_chroma import Chroma
from pinecone import Pinecone

# from util.embedding_function import get_embedding_function

import os
import time

CHROMA_PATH = "../data/processed"

def load_documents(url):
  loader = PyPDFLoader(url)
  print(loader)
  return loader.load()

def split_documents(documents):
  text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50, add_start_index=True)

  records = []
  for idx, split in enumerate(text_splitter.split_documents(documents)):
    records.append({
        "_id": f"document#chunk{idx}",
        "author": split.metadata["author"],
        "start_index": split.metadata["start_index"],
        "page": split.metadata["page"],
        "page_label": split.metadata["page_label"],
        "chunk_text": split.page_content
    })
  # return text_splitter.split_documents(documents)
  return records

def add_to_chroma(documents):
  # if os.path.exists(CHROMA_PATH):
  #   shutil.rmtree(CHROMA_PATH)

  #load the existing database
  start = time.time()
  
  # db = Chroma(persist_directory=CHROMA_PATH, embedding_function=get_embedding_function())  
  # db.add_documents(documents)

  pc = Pinecone(api_key=os.getenv('PINECONE_API_KEY'))
  index = pc.Index(host=os.getenv('PINECONE_HOST'))

  index_name = "pola-index"
  if not pc.has_index(index_name):
    pc.create_index_for_model(name=index_name,
                              cloud="aws",
                              region="us-east-1",
                              embed={
                                  "model": "llama-text-embed-v2",
                                  "field_map": {
                                      "text": "chunk_text"
                                  }
                              }) 

  for i in range(0, len(documents), 90):

      index.upsert_records(namespace=index_name, records=documents[i:i + 90])

  print("-" * 40)
  print("Documents added to Pinecone successfully.")
  print(f"Time taken to embed: {time.time() - start} seconds")
  print("-" * 40)
