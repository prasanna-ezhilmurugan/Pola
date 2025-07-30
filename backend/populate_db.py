from langchain_community.document_loaders.pdf import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain.schema import Document
# from langchain_chroma import Chroma
from pinecone import Pinecone

# from util.embedding_function import get_embedding_function

import os
import time
import asyncio

CHROMA_PATH = "../data/processed"

async def load_documents(url):
    loader = PyPDFLoader(url)
    # If loader.load() is blocking, run in a thread
    return await asyncio.to_thread(loader.load)

async def split_documents(documents):
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50, add_start_index=True)
    def split():
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
        return records
    return await asyncio.to_thread(split)

async def add_to_pinecone(documents, namespace):
    start = time.time()
    pc = Pinecone(api_key=os.getenv('PINECONE_API_KEY'))
    index = pc.Index(host=os.getenv('PINECONE_HOST'))

    index_name = "pola-index"
    if not pc.has_index(index_name):
        await asyncio.to_thread(
            pc.create_index_for_model,
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
