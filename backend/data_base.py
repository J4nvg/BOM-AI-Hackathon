import requests
from bs4 import BeautifulSoup
from sentence_transformers import SentenceTransformer
from sentence_transformers import util
import torch
from llama_index.core.schema import Document
from llama_index.core.node_parser import SemanticSplitterNodeParser
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from fetch_text_from_web import fetch_page_text

model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

splitter = SemanticSplitterNodeParser(
    embed_model=model,
    buffer_size=1,
    breakpoint_percentile_threshold=95,
)

cancer_input = input("Cancer that you would like to know:")
cancer_type = ["Breast Cancer", "Colorectal Cancer", "Prostate Cancer"]

information_type = ["general_info", "anatomy", "statistics", "treatment"


knowledge_map = {
    "general_info": {
        "label": "General Information",
        "primary_source": "kanker.nl", # Patient-friendly starting point [cite: 55]
        "description": "Basic facts and overview of the cancer type."
    },
    "anatomy": {
        "label": "Anatomy & Location",
        "primary_source": "iknl.nl", # Expert interpretation [cite: 56]
        "description": "Where in the body the cancer affects and how it spreads."
    },
    "statistics": {
        "label": "Statistics",
        "sources": ["nkr-cijfers.nl", "kankeratlas.iknl.nl"], # Survival, incidence, and regional data [cite: 57, 60]
        "metrics": ["Mortality", "Recovery", "Survival", "Recurrence"]
    },
    "treatment": {
        "label": "Benchmarks & Treatment",
        "primary_source": "richtlijnendatabase.nl", # Official oncology guidelines [cite: 61]
        "description": "Standardized pathways and clinical benchmarks."
    },
    "research": {
        "label": "Scientific Publications",
        "sources": ["IKNL Reports", "Scientific Publications"], # Deep dives and analysis [cite: 58, 62]
        "description": "Latest findings and extensive research reports."
    },
    "location": {
        "label": "Location of Cancer",
        "sources": "kankeratlas.iknl.nl",
        "description": "Location about the occurrence of cancer in the Netherland",
    },
    "target_groups": [
        "Patients & Loved Ones", 
        "Healthcare Professionals", 
        "Policymakers" # VWS, RIVM, ZINL [cite: 25]
    ]
}

