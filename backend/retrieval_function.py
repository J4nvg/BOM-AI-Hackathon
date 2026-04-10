import torch
from sentence_transformers import SentenceTransformer, util

# 1. SETUP: Using a lightweight model for the hackathon
model = SentenceTransformer("all-MiniLM-L6-v2")

# 2. THE TRUSTED KNOWLEDGE BASE (Simulated Vector DB results)
# In your real app, these would be chunks scraped from kankeratlas.iknl.nl
knowledge_base = [
    {
        "id": "atlas_general_01",
        "cancer_type": "general",
        "text": "The Dutch Cancer Atlas shows regional variation for 24 types of cancer using Standardized Incidence Ratios (SIR).",
        "source": "https://kankeratlas.iknl.nl/over-de-atlas"
    },
    {
        "id": "atlas_breast_01",
        "cancer_type": "breast",
        "text": "For breast cancer, there is no or hardly any significant regional variation in the Netherlands. The map is mostly yellow, meaning incidence is equal to the national average.",
        "source": "https://kankeratlas.iknl.nl/info-kankersoorten/borstkanker",
        "reliability": "High (IKNL Expert Interpretation)"
    },
    {
        "id": "atlas_skin_01",
        "cancer_type": "skin",
        "text": "Skin cancer (melanoma) shows clear clusters in coastal regions due to higher UV exposure levels.",
        "source": "https://kankeratlas.iknl.nl/info-kankersoorten/huidkanker"
    }
]

# 3. THE RETRIEVAL FUNCTION
def reliable_retrieval(user_query, target_cancer_type):
    # Step A: Pre-filter by metadata (Cancer Type)
    # This is the "Filter-based" approach we discussed to avoid noise
    filtered_docs = [doc for doc in knowledge_base 
                     if doc["cancer_type"] == target_cancer_type or doc["cancer_type"] == "general"]
    
    if not filtered_docs:
        return "No specific data found for this cancer type in the IKNL atlas."

    # Step B: Semantic Search (Cosine Similarity)
    doc_texts = [d["text"] for d in filtered_docs]
    doc_embeddings = model.encode(doc_texts)
    query_embedding = model.encode(user_query)
    
    scores = util.cos_sim(query_embedding, doc_embeddings)[0]
    top_idx = torch.argmax(scores).item()
    
    return filtered_docs[top_idx]

# 4. EXECUTION
user_filter = "breast"  # Selected from your UI dropdown
user_query = f"Which location has the highest rate of {user_filter} cancer?"

result = reliable_retrieval(user_query, user_filter)

# 5. OUTPUT (To be passed to your LLM for summarization or shown directly)
print(f"\n ANSWER CHUNK: {result['text']}")
print(f"SOURCE: {result['source']}")
print(f"PROVENANCE: {result.get('reliability', 'Verified IKNL Source')}")