import asyncio
from langchain_chroma import Chroma
from langchain.prompts import PromptTemplate
# from langchain_community.llms.ollama import Ollama
# from util.embedding_function import get_embedding_function
from mistralai import Mistral
from groq import Groq
from pinecone_client import index

import httpx
import time
import os

# CHROMA_PATH = "../data/processed"

PROMPT_TEMPLATE = """
You are a policy analyst AI trained to extract precise and structured answers from health insurance documents. Use the context provided to answer the user's question clearly and professionally.

## CONTEXT:
{context}

## QUESTION:
{question}

## GUIDELINES:
- Base your answer **only** on the context provided.
- The answer should:
  1. Start with a **direct yes/no or definition**, if applicable.
  2. Include **conditions, eligibility, or policy duration**, if relevant.
  3. Mention **numerical limits, caps, or time frames** when stated.
  4. Quote or summarize clauses or sections **if they’re explicitly present**.
- Do **not** fabricate or assume details not included in the context.
- Avoid generic disclaimers (e.g., "based on the context").
- If the answer is not present, say: **"The provided document does not contain the answer."**

## FORMAT:
- Respond in 1–3 well-structured sentences.
- Use clear and formal language.
- Use policy-specific terms such as "Sum Insured", "Clause", "Waiting Period", etc.

## FINAL ANSWER:
"""

async def retrive_context(query: str, namespace: str) -> str:

    # Run blocking Pinecone search in a thread
    results = await asyncio.to_thread(
        index.search,
        namespace=namespace,
        query={
            "top_k": 4,
            "inputs": {"text": query},
        }
    )

    chunks = []
    for i, result in enumerate(results['result']['hits']):
        feilds = result['fields']
        text = feilds.get("chunk_text", "")
        page = feilds.get("page", "N/A")
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
        "temperature": 0.0,
    }
    
    # print(f"[INFO] Asking LLM with prompt: {prompt}")

    # Run blocking Mistral API call in a thread
    start = time.time()
    # client = Mistral(api_key=os.getenv('MISTRAL_API_KEY'))
    # chat_response = await asyncio.to_thread(
    #     client.chat.complete,
    #     model="mistral-small",
    #     messages=[
    #         {"role": "user", "content": prompt}
    #     ]
    # )
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers=headers,
            json=body
        )
        response.raise_for_status()
        data = response.json()
        
    print(f"Time taken to query: {time.time() - start} seconds")
    # return chat_response.choices[0].message.content
    return data["choices"][0]["message"]["content"]

async def query_rag(query_text: str, namespace: str):
    context_text = await retrive_context(query_text, namespace)
    response_text = await ask_llm(query_text, context_text)

    return response_text