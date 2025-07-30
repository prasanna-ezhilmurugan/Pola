import hashlib
import aiohttp

async def compute_hash(file_path: str) -> str:
    async with aiohttp.ClientSession() as session:
        async with session.get(file_path) as response:
            if response.status != 200:
                raise Exception(f"Failed to fetch document. Status : {response.status}")

            file_content = await response.read()
            hash_object = hashlib.sha256(file_content)
            sha256 = hash_object.hexdigest()
            return sha256