import requests
import os

def download_file(url, filename = None):
  try:
    if filename is None:
        filename = os.path.basename(url).split('?')[0]  # Extract filename from URL

    response = requests.get(url, stream=True)
    response.raise_for_status()  # Check for HTTP errors  

    with open(filename, 'wb') as f:
      for chunk in response.iter_content(chunk_size=8192):
          f.write(chunk)

    print(f"Document downloaded successfully: {filename}")

  except requests.exceptions.RequestException as e:
     print(f"Error downloading the document: {e}")
  except Exception as e:
     print(f"An unexpected error occured: {e}")
