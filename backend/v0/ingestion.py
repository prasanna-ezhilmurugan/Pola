#!/usr/bin/env python3

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_ollama import OllamaEmbeddings
from langchain_community.llms import Ollama
from langchain_core.vectorstores import InMemoryVectorStore

import pickle
import os

loader = PyPDFLoader("../data/raw/document1.pdf")
docs = loader.load()

text_splitter = RecursiveCharacterTextSplitter(chunk_size=200,
                                               chunk_overlap=40,
                                               add_start_index=True)
all_splits = text_splitter.split_documents(docs)

embeddings = None
vector_store = None
indices = None

embeddings = OllamaEmbeddings(model="phi4-mini")
vector_store = InMemoryVectorStore(embeddings)
if os.path.exists("vector_store.pkl"):
    with open("vector_store.pkl", "rb") as f:
        indices = pickle.load(f)
else:
    indices = vector_store.add_documents(documents=all_splits)
    with open("vector_store.pkl", "wb") as f:
        pickle.dump(vector_store, f)

phi4_mini = Ollama(model="phi4-mini")

while True:
    qs = input("> ")
    results = vector_store.similarity_search(qs)
    response = phi4_mini.invoke(
        f"go through this text '{results[0]}' and answer {qs} which just a yes or no response, if yes then elaborate and show reference or else ask again for more context"
    )
    print(response)