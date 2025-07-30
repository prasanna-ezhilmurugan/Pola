from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain.schema import Document
# from langchain_chroma import Chroma

# from util.embedding_function import get_embedding_function

from urllib.parse import urlparse
import tempfile
import aiohttp
from langchain_community.document_loaders import (
    PyPDFLoader,
    UnstructuredWordDocumentLoader,
    UnstructuredEmailLoader,
    TextLoader,
)

from pinecone_client import index, pinecone_client

import os
import time
import asyncio

# CHROMA_PATH = "../data/processed"

def get_file_extension_from_url(url: str) -> str:
    parsed = urlparse(url)
    path = parsed.path
    ext = os.path.splitext(path)[-1].lower()
    return ext

def normalize_metadata(metadata: dict) -> dict:
    return {
        "author": metadata.get("author", "Unknown"),
        "page": metadata.get("page", "N/A"),
        "start_index": metadata.get("start_index", 0),
        "page_label": metadata.get("page_label", "")
    }


async def load_documents(url):
    ext = get_file_extension_from_url(url)

    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            if response.status != 200:
                raise Exception(f"Failed to fetch document. Status: {response.status}")

            content = await response.read()
            with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp_file:
                tmp_file.write(content)
                tmp_file_path = tmp_file.name

    try:

        if ext == ".pdf":
            loader = PyPDFLoader(tmp_file_path)
        elif ext in ".docx":
            loader = UnstructuredWordDocumentLoader(tmp_file_path)
        elif ext in [".eml", ".msg"]:
            loader = UnstructuredEmailLoader(tmp_file_path)
        elif ext == ".txt":
            loader = TextLoader(tmp_file_path) 
        else:
            raise Exception(f"Unsupported file type: {ext}")

        return await asyncio.to_thread(loader.load)

    finally:
        # Clean up the temporary file
        if os.path.exists(tmp_file_path):
            os.remove(tmp_file_path)
  

async def split_documents(documents):
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50, add_start_index=True)
    def split():
        records = []
        for idx, split in enumerate(text_splitter.split_documents(documents)):
            meta = normalize_metadata(split.metadata)
            records.append({
                "_id": f"document#chunk{idx}",
                **meta,
                "chunk_text": split.page_content
            })
        return records
    return await asyncio.to_thread(split)

async def add_to_pinecone(documents, namespace):
    start = time.time()

    index_name = "pola-index"
    if not pinecone_client.has_index(index_name):
        await asyncio.to_thread(
            pinecone_client.create_index_for_model,
            name=index_name,
            cloud="aws",
            region="us-east-1",
            embed={
                "model": "llama-text-embed-v2",
                "field_map": {
                    "text": "chunk_text"
                }
            }
        )

    async def upsert_chunk(chunk):
        await asyncio.to_thread(index.upsert_records, namespace=namespace, records=chunk)

    # Upsert in parallel for better performance
    for i in range(0, len(documents), 50):
        chunk = documents[i:i + 50]
        await upsert_chunk(chunk)

    print("-" * 40)
    print("Documents added to Pinecone successfully.")
    print(f"Time taken to embed: {time.time() - start} seconds")
    print("-" * 40)
