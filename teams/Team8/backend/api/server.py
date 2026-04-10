from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy import create_engine, Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship, Session
from api_sql_schema import SessionLocal, Cancer, Information
from typing import Optional

# 3. FastAPI App
app = FastAPI()

# Dependency to get the database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 4. The Endpoint (All cancers)
@app.get("/cancers")
def get_all_cancer_info(db: Session = Depends(get_db)):
    # Query all cancers from the database
    cancers = db.query(Cancer).all()
    
    # Format the output into a nice nested JSON structure
    results = []
    for cancer in cancers:
        results.append({
            "cancer_name": cancer.name,
            "information": [
                {
                    "type": info.info_type, 
                    "content": info.info_content
                } 
                for info in cancer.information_entries
            ]
        })
        
    return {"status": "success", "count": len(results), "data": results}



import json
from fastapi import HTTPException, Depends
from typing import Optional
from sqlalchemy.orm import Session

# Assuming app, get_db, Cancer are defined elsewhere

@app.get("/cancers/{cancer_name}")
def get_cancer_info_by_name(cancer_name: str, info_type: Optional[str] = None, db: Session = Depends(get_db)):
    # Format the URL parameter to match the database (e.g., 'breast_cancer' -> 'Breast Cancer')
    formatted_name = cancer_name.replace('_', ' ').title()
    
    # Query the database for the specific cancer type
    cancer = db.query(Cancer).filter(Cancer.name == formatted_name).first()
    
    # If the cancer type isn't in the database, return a 404 error
    if not cancer:
        raise HTTPException(status_code=404, detail=f"Cancer type '{formatted_name}' not found")
    
    # Start with all the information linked to this cancer
    filtered_info = cancer.information_entries
    
    # If the frontend provided an 'info_type' query parameter, filter the list in Python
    if info_type:
        filtered_info = [info for info in filtered_info if info.info_type == info_type]
        
    # Format the output to exactly match the frontend's expected structure
    formatted_results = []
    for info in filtered_info:
        # Unpack the JSON string stored in the database
        try:
            content_dict = json.loads(info.info_content)
        except json.JSONDecodeError:
            content_dict = {} # Fallback in case of bad data
            
        formatted_results.append({
            "id": info.id,
            "title": content_dict.get("title", ""),
            "description": content_dict.get("text", ""),  # Mapping JSON 'text' to 'description'
            "source": content_dict.get("sources", [])     # Mapping JSON 'sources' to 'source'
        })
        
    # Returning the array directly as the frontend expects
    return formatted_results
