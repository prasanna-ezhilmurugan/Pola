from langchain_community.embeddings.bedrock import BedrockEmbeddings

def get_embedding_function():
  embedding = BedrockEmbeddings(
    credential_profile_name = "default", region_name="us-east-1"
  )
  return embedding