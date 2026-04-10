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

import json
from fastapi import HTTPException, Depends, Query
from typing import Optional, List
from sqlalchemy.orm import Session
from api_sql_schema import SessionLocal, Cancer, Information

# Dependency to get the database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/cancers/{cancer_name}")
def get_cancer_info_by_name(
    cancer_name: str, 
    info_type: Optional[str] = None, 
    exclude_ids: Optional[List[int]] = Query(None),
    db: Session = Depends(get_db)
):
    # Format the URL parameter to match the database (e.g., 'breast_cancer' -> 'Breast Cancer')
    formatted_name = cancer_name.replace('_', ' ').title()
    
    # Query the database for the specific cancer type
    cancer = db.query(Cancer).filter(Cancer.name == formatted_name).first()
    
    # If the cancer type isn't in the database, return a 404 error
    if not cancer:
        raise HTTPException(status_code=404, detail=f"Cancer type '{formatted_name}' not found")
    
    # Start with all the information linked to this cancer
    filtered_info = cancer.information_entries
    
    # Filter by info_type if provided
    if info_type:
        filtered_info = [info for info in filtered_info if info.info_type == info_type]
        
    # Filter out unwanted IDs if the frontend provided them
    if exclude_ids:
        filtered_info = [info for info in filtered_info if info.id not in exclude_ids]
        
    # Format the output to exactly match the frontend's expected structure
    formatted_results = []
    for info in filtered_info:
        # Unpack the JSON string stored in the database
        try:
            content_dict = json.loads(info.info_content)
        except json.JSONDecodeError:
            content_dict = {} # Fallback in case of bad data
            
        # Build the base item handling both your old and new JSON keys
        result_item = {
            "id": info.id,
            "title": content_dict.get("title", ""),
            # Looks for 'description', falls back to 'text' if not found
            "description": content_dict.get("description", content_dict.get("text", "")),  
            # Looks for 'source' string, falls back to 'sources' array if not found
            "source": content_dict.get("source", content_dict.get("sources", []))     
        }
        
        # Check for optional chart/graph data and append it if it exists
        optional_chart_keys = ["sourceType", "chartData", "chartXKey", "chartDataKey", "chartLabel"]
        for key in optional_chart_keys:
            if key in content_dict:
                result_item[key] = content_dict[key]
                
        formatted_results.append(result_item)
        
    # Returning the array directly as the frontend expects
    return formatted_results
