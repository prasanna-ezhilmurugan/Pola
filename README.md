project-root/
├── frontend/                     # Your Next.js app (TypeScript)
│   ├── public/                   # Static files (images, fonts, etc.)
│   ├── src/
│   │   ├── app/                  # App Router entry points (routes, layouts)
│   │   ├── components/           # Reusable UI components
│   │   ├── lib/                  # Utilities and helpers
│   │   ├── styles/               # Global and component styles
│   │   └── types/                # TypeScript type definitions
│   ├── package.json
│   ├── next.config.js
│   ├── tsconfig.json
│   └── tailwind.config.js       # (if using Tailwind CSS)
│
├── backend/                      # Your Python API (LLM, document parsing)
│   ├── app/                      # Python package source
│   │   ├── ingestion.py          # Parsing and chunking code
│   │   ├── search.py             # Embedding, vector store, retrieval
│   │   ├── llm.py                # LLM decision logic
│   │   └── main.py               # API endpoints (e.g., FastAPI)
│   ├── requirements.txt
│   └── tests/                    # Unit/integration tests
│
├── data/                         # Documents, queries, results
│   ├── raw/                      # Original unprocessed data
│   ├── processed/                # Preprocessed or cleaned data
│   └── sample-queries.json       # Example queries
│
├── README.md
└── .gitignore

