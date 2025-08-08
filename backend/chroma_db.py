from langchain_chroma import Chroma
from util.embedding_function import get_embedding_function

CHROMA_PATH = "./pola_index"

chroma_db = Chroma(collection_name="pola_collection", embedding_function=get_embedding_function(), persist_directory=CHROMA_PATH)