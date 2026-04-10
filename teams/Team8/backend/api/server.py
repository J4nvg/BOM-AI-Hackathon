from fastapi import FastAPI, Depends
from sqlalchemy import create_engine, Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship, Session

# 1. Database Setup
DATABASE_URL = "mysql+pymysql://root:password@localhost:3306/medical_info_db"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# 2. Define the ORM Models
class Cancer(Base):
    __tablename__ = "cancer"
    
    name = Column(String(255), primary_key=True)
    
    # This sets up the relationship so you can easily access linked information
    information_entries = relationship("Information", back_populates="cancer")

class Information(Base):
    __tablename__ = "information"
    
    id = Column(Integer, primary_key=True, index=True)
    cancer_name = Column(String(255), ForeignKey("cancer.name", ondelete="CASCADE"))
    info_type = Column(String(50))
    info_content = Column(Text)
    
    # Links back to the Cancer model
    cancer = relationship("Cancer", back_populates="information_entries")

# (Optional) Create tables if they don't exist yet
Base.metadata.create_all(bind=engine)

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
