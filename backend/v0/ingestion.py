#!/usr/bin/env python3

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_ollama import OllamaEmbeddings
from langchain_ollama import OllamaLLM
from langchain_core.vectorstores import InMemoryVectorStore
from langchain_community.docstore.in_memory import InMemoryDocstore
from langchain_community.vectorstores import FAISS

import faiss

import pickle
import os

import time

loader = PyPDFLoader("./doc.pdf")
docs = loader.load()

text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000,
                                               chunk_overlap=300,
                                               add_start_index=True)
all_splits = text_splitter.split_documents(docs)

embeddings = OllamaEmbeddings(model="nomic-embed-text")
index = faiss.IndexFlatL2(len(embeddings.embed_query("hello world!")))

vector_store = FAISS(
    embedding_function=embeddings,
    index=index,
    docstore=InMemoryDocstore(),
    index_to_docstore_id={},
)

print("Indexing...", end='', flush=True)
start = time.time()
vector_store.add_documents(documents=all_splits)
end = time.time()
print(f"{end - start}s", flush=True)

phi4_mini = OllamaLLM(model="phi4-mini")

while True:
    qs = input("> ")
    print("Getting response...", flush=True)
    start = time.time()
    results = vector_store.similarity_search(qs, k=5)
    context = []
    # print("Results")
    # print("-" * 10)
    # print(type(results))
    # print(results)
    # print("-" * 10)
    for result in results:
        context.append({
            "id": result.id,
            "page": result.metadata["page"],
            "page_label": result.metadata["page_label"],
            "page_content": result.page_content,
            "start_index": result.metadata["start_index"]
        })

    # print("context")
    # print("-" * 10)
    # print(context)
    # print("-" * 10)
    response = phi4_mini.invoke(
        f"using the given context: {context}, answer the question {qs}, 1. answer with only a yes or no if applicable\n 2. if yes, explain and show reference\n 3. if no ask to repeat with more context"
    )
    print(response)
    end = time.time()
    print(f"Time taken: {end - start}s", flush=True)
