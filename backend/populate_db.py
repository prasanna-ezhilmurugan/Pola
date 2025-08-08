from langchain_text_splitters import RecursiveCharacterTextSplitter
from chroma_db import chroma_db
from langchain_core.documents import Document

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

# from pinecone_client import index
from qlog import log_info, global_logger_state

import os
import time
import asyncio

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
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=700, chunk_overlap=200, add_start_index=True)
    def split():
        records = []
        for idx, split in enumerate(text_splitter.split_documents(documents)):
            meta = normalize_metadata(split.metadata)
            records.append(Document(
                id = f"document#chunk{idx}",
                metadata = meta,
                page_content = split.page_content
            ))
        return records
    return await asyncio.to_thread(split)

async def add_to_db(documents, namespace):
    start = time.time()

    chroma_db.add_documents(documents=documents)

    log_info(global_logger_state, f"Added chunks to DB under namespace: {namespace}")
    log_info(global_logger_state, f"Time taken to add chunks to DB: {time.time() - start} seconds")