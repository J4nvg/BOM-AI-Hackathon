from fastapi import FastAPI, Depends
from sqlalchemy import create_engine, Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship, Session
from api_sql_schema import SessionLocal, Cancer, Information


# 3. FastAPI App
app = FastAPI()

# Dependency to get the database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 4. The Endpoint
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
