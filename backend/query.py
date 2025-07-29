import asyncio
from langchain_chroma import Chroma
from langchain.prompts import PromptTemplate
# from langchain_community.llms.ollama import Ollama
# from util.embedding_function import get_embedding_function
from mistralai import Mistral
from pinecone import Pinecone

import time
import os

# CHROMA_PATH = "../data/processed"

PROMPT_TEMPLATE = """
You are an intelligent assistant designed to extract precise answers from insurance policy documents. Use the following context to answer the question factually and concisely.

# CONTEXT:
{context}

# QUESTION:
{question}

# INSTRUCTIONS:
- Answer only if the context contains enough information.
- Limit your answer to 1–3 clear, factual sentences.
- Do not include disclaimers like "based on the context provided".
- Mention specific clauses or section numbers only if directly present in the context.
- Do not make assumptions or use external knowledge.
- If the answer is not in the context, respond with: "The provided document does not contain the answer."

# FINAL ANSWER:
"""

async def query_rag(query_text: str):
    # embedding_function = get_embedding_function()
    # db = Chroma(persist_directory=CHROMA_PATH, embedding_function=embedding_function)

    db = Pinecone(api_key=os.getenv('PINECONE_API_KEY'))
    index_name = "pola-index"
    index = db.Index(host=os.getenv('PINECONE_HOST'))

    # Run blocking Pinecone search in a thread
    results = await asyncio.to_thread(
        index.search,
        namespace=index_name,
        query={
            "top_k": 5,
            "inputs": {"text": query_text},
        }
    )

    context_text = []
    for result in results['result']['hits']:
        context_text.append(str(result['fields']))
    context_text = "\n\n---\n\n".join(context_text)

    prompt_template = PromptTemplate.from_template(PROMPT_TEMPLATE)
    prompt = prompt_template.format(context=context_text, question=query_text)

    # Run blocking Mistral API call in a thread
    start = time.time()
    client = Mistral(api_key=os.getenv('MISTRAL_API_KEY'))
    chat_response = await asyncio.to_thread(
        client.chat.complete,
        model="mistral-medium",
        messages=[
            {"role": "user", "content": prompt}
        ]
    )
    print(f"Time taken to query: {time.time() - start} seconds")

    # return response_text
    return chat_response.choices[0].message.content
