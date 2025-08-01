import os
from pinecone import Pinecone
from dotenv import load_dotenv

load_dotenv()

PINECONE_API_KEY = os.getenv('PINECONE_API_KEY')
PINECONE_HOST = os.getenv('PINECONE_HOST')

index_name = "pola-index"
pinecone_client = Pinecone(api_key=PINECONE_API_KEY)
index = pinecone_client.Index(host=PINECONE_HOST)