from sqlalchemy import create_engine, Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship

# 1. Database Setup
DATABASE_URL = "mysql+pymysql://root:password@localhost:3306/medical_info_db"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# 2. Define the ORM Models
class Cancer(Base):
    __tablename__ = "cancer"
    
    name = Column(String(255), primary_key=True)
    information_entries = relationship("Information", back_populates="cancer")

class Information(Base):
    __tablename__ = "information"
    
    id = Column(Integer, primary_key=True, index=True)
    cancer_name = Column(String(255), ForeignKey("cancer.name", ondelete="CASCADE"))
    info_type = Column(String(50))
    info_content = Column(Text)
    
    cancer = relationship("Cancer", back_populates="information_entries")

# Create tables if they don't exist yet
Base.metadata.create_all(bind=engine)
