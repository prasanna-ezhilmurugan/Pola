from langchain_community.vectorstores.chroma import Chroma
from langchain.prompts import PromptTemplate
from langchain_community.llms.ollama import Ollama
from util.embedding_function import get_embedding_function

CHROMA_PATH = "../data/processed"

PROMPT_TEMPLATE = """
Answer the question based on the following context:

{context}

---

Answer the question based on the above context: {question}
"""

def query_rag(query_text: str):
  embedding_function = get_embedding_function()
  db = Chroma(persist_directory=CHROMA_PATH, embedding_function=embedding_function)

  # Search in the db
  results = db.similarity_search_with_score(query_text, k=5)

  context_text = "\n\n---\n\n".join([doc.page_content for doc, _score in results])
  prompt_template = PromptTemplate.from_template(PROMPT_TEMPLATE)
  prompt = prompt_template.format(context = context_text, question=query_text)

  model = Ollama(model="Phi4-mini")
  response_text = model.invoke(prompt)

  return response_text
