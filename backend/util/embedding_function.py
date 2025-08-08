# from langchain_community.embeddings.bedrock import BedrockEmbeddings
from langchain_ollama.embeddings import OllamaEmbeddings
# from langchain_nomic import NomicEmbeddings
# from langchain_mistralai import MistralAIEmbeddings
# from langchain_pinecone import PineconeEmbeddings

import os

def get_embedding_function():
  # embedding = BedrockEmbeddings(
  #   credential_profile_name = "default", region_name="us-east-1"
  # )

  embedding = OllamaEmbeddings(base_url="https://pelican-immortal-guinea.ngrok-free.app/", model="nomic-embed-text") 

  # embedding = NomicEmbeddings(model="nomic-embed-text-v2", inference_mode="remote", nomic_api_key=os.getenv('NOMIC_API_KEY'))

  # embedding = MistralAIEmbeddings(
  #   model="mistral-embed",
  #   api_key=os.getenv('MISTRAL_API_KEY'),
  # )

  return embedding