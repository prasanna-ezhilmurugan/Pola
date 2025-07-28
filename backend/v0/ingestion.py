#!/usr/bin/env python3

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_ollama import OllamaEmbeddings
from langchain_ollama import OllamaLLM
from langchain_core.vectorstores import InMemoryVectorStore
from langchain_community.docstore.in_memory import InMemoryDocstore
from langchain_community.vectorstores import FAISS

from pinecone import Pinecone

import faiss

import pickle
import os

import time

loader = PyPDFLoader(os.sys.argv[1])
docs = loader.load()

text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000,
                                               chunk_overlap=300,
                                               add_start_index=True)
all_splits = text_splitter.split_documents(docs)

pc = Pinecone(
    api_key=
    "pcsk_wd5TE_MewARsPqqLZrLXKEe42Wj3xRyBt7Bk9jMB2Ui1jYTPGY26jjdc3yVEaotpz159Q"
)

index_name = "integrated-dense-py"

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

records = []

for idx, split in enumerate(all_splits):
    records.append({
        "_id": f"document#chunk{idx}",
        "author": split.metadata["author"],
        "start_index": split.metadata["start_index"],
        "page": split.metadata["page"],
        "page_label": split.metadata["page_label"],
        "chunk_text": split.page_content
    })

# embeddings = OllamaEmbeddings(model="nomic-embed-text")
# index = faiss.IndexFlatL2(len(embeddings.embed_query("hello world!")))

# vector_store = FAISS(
# embedding_function=embeddings,
# index=index,
# docstore=InMemoryDocstore(),
# index_to_docstore_id={},
# )

# vector_store.add_documents(documents=all_splits)

print("Indexing...", end='', flush=True)
start = time.time()
index = pc.Index(
    host="https://integrated-dense-py-j1kgfpb.svc.aped-4627-b74a.pinecone.io")

for i in range(0, len(records), 90):
    index.upsert_records(index_name, records[i:i + 90])
end = time.time()
print(f"{end - start}s", flush=True)

phi4_mini = OllamaLLM(model="phi4-mini")

while True:
    qs = input("> ")
    print("Getting response...", flush=True)

    results = index.search(namespace=index_name,
                           query={
                               "top_k": 5,
                               "inputs": {
                                   "text": qs
                               }
                           })
    # os.sys.exit(7)

    # start = time.time()
    # results = vector_store.similarity_search(qs, k=5)
    context = []
    for result in results["result"]["hits"]:
        context.append({
            "author": result["fields"]["author"],
            "page": result["fields"]["page"],
            "page_label": result["fields"]["page_label"],
            "page_content": result["fields"]["chunk_text"],
        })

    print(context)

    start = time.time()
    response = phi4_mini.invoke(
        f"using the given context: {results}, answer the question {qs} with the following conditions: 1. answer with a yes or no, if possible\n 2. if yes, elaborate and show references at the last\n 3. if no ask to repeat with more context\n4. clear any dirty ascii characters"
    )

    print(response)
    end = time.time()
    print(f"Time taken: {end - start}s", flush=True)
