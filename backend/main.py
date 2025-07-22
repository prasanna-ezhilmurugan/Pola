from PyPDF2 import PdfReader

reader = PdfReader("../data/raw/document3.pdf")

for page in reader.pages:
  print(page.extract_text())