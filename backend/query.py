import asyncio
from langchain_chroma import Chroma
from langchain.prompts import PromptTemplate
# from langchain_community.llms.ollama import Ollama
# from util.embedding_function import get_embedding_function
# from pinecone_client import index
from chroma_db import chroma_db
from qlog import log_info, global_logger_state

import httpx
import time
import os
import random

# CHROMA_PATH = "../data/processed"

PROMPT_TEMPLATE = """
You are a professional policy analyst. Given the context, answer the user's question with precision, completeness, and clarity. Use appropriate terminology.

## CONTEXT:
{context}

## QUESTION:
{question}

## GUIDELINES:
- Answer **only** using the provided context. Never guess or fabricate.
- If the question has **multiple subparts**, answer each one concisly with a comma.
- If applicable, your response must:
  1. Start with a **direct yes/no or definition**.
  2. Include **eligibility criteria, age limits, or duration clauses**.
  3. Mention **waiting periods, co-payments, Sum Insured limits, exclusions**, etc.
  4. Do not quote or paraphrase specific **Clause numbers** or section titles when available.
- If **any subpart is not addressed** in the context, write:  
  - `The document does not contain the answer.`  
    (Use this only **per subpart**, not for the entire question unless fully absent.)
- Do **not** refer to "chunks", "context", or "PDF" in your response.

## FINAL ANSWER:
"""

async def retrive_context(query: str, namespace: str) -> str:

    # Run blocking Pinecone search in a thread
    results = await asyncio.to_thread(
        chroma_db.similarity_search,
        query,
        k = 4,
    )

    # print(results)

    chunks = []
    for i, result in enumerate(results):
        meta = result.metadata
        text = result.page_content
        page = meta['page']
        label = f"### chunk {i + 1} (Page {page})"
        formatted_chunk = f"{label}\n\n{text}"
        chunks.append(formatted_chunk)
        
    context_text = "\n\n---\n\n".join(chunks)
    return context_text
    

async def ask_llm(query: str, context: str) -> str:
    prompt_template = PromptTemplate.from_template(PROMPT_TEMPLATE)
    prompt = prompt_template.format(context=context, question=query)
    
    headers = {
        "Authorization": f"Bearer {os.getenv('GROQ_API_KEY')}",
        "Content-Type": "application/json"
    }

    body = {
        "model": "llama3-70b-8192",  # or "mixtral-8x7b-32768" if preferred
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 1024,
        "temperature": 0.3,
    }
    
    max_retries = 5
    backoff_base = 2
    for attempt in range(max_retries):
        start = time.time()
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers=headers,
                json=body
            )
            if response.status_code == 429:
                wait_time = backoff_base ** attempt + random.uniform(0, 1)
                log_info(global_logger_state, f"Received 429. Retrying in {wait_time:.2f} seconds...")
                await asyncio.sleep(wait_time)
                continue
            response.raise_for_status()
            data = response.json()
            log_info(global_logger_state, f"Time taken to query: {time.time() - start} seconds")
            return data["choices"][0]["message"]["content"]

async def query_rag(query_text: str, namespace: str):
    context_text = await retrive_context(query_text, namespace)
    response_text = await ask_llm(query_text, context_text)

    return response_text