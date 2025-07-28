from langchain_chroma import Chroma
from langchain.prompts import PromptTemplate
# from langchain_community.llms.ollama import Ollama
from util.embedding_function import get_embedding_function
from mistralai import Mistral

import time
import os

CHROMA_PATH = "../data/processed"

PROMPT_TEMPLATE = """
Answer the question based on the following context:

{context}

---

Answer the question based on the above context: {question}
"""

def query_rag(query_text: str):
  start = time.time()

  embedding_function = get_embedding_function()
  db = Chroma(persist_directory=CHROMA_PATH, embedding_function=embedding_function)

  print(f"Time taken to embed: {time.time() - start} seconds")

  # Search in the db
  results = db.similarity_search_with_score(query_text, k=5)

  context_text = "\n\n---\n\n".join([doc.page_content for doc, _score in results])
  prompt_template = PromptTemplate.from_template(PROMPT_TEMPLATE)
  prompt = prompt_template.format(context = context_text, question=query_text)

  # model = Ollama(model="Phi4-mini")
  # response_text = model.invoke(prompt)

  start = time.time()

  client = Mistral(api_key=os.getenv('MISTRAL_API_KEY')) 
  chat_response = client.chat.complete(
    model="mistral-tiny",
    messages=[
      {"role": "user", "content": prompt}
    ]
  )

  print(f"Time taken to query: {time.time() - start} seconds")

  # return response_text
  return chat_response.choices[0].message.content
