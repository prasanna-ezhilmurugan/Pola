from langchain_community.document_loaders.pdf import PyPDFDirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain.schema import Document
from langchain_chroma import Chroma

from util.embedding_function import get_embedding_function

import os
import shutil
import time

CHROMA_PATH = "../data/processed"

def load_documents():
  loader = PyPDFDirectoryLoader(r"../data/raw")
  return loader.load()

def split_documents(documents :list[Document]):
  text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50, add_start_index=True)
  return text_splitter.split_documents(documents)

def add_to_chroma(documents :list[Document]):
  if os.path.exists(CHROMA_PATH):
    shutil.rmtree(CHROMA_PATH)

  #load the existing database
  start = time.time()
  db = Chroma(persist_directory=CHROMA_PATH, embedding_function=get_embedding_function())  
  db.add_documents(documents)
  print("-" * 40)
  print("Documents added to Chroma successfully.")
  print(f"Time taken to embed: {time.time() - start} seconds")
  print("-" * 40)
