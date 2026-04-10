import json
from sqlalchemy import create_engine, Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship, Session
from api_sql_schema import SessionLocal, Cancer, Information


def insert_json(json_filepath: str):
    # Open a new database session
    db: Session = SessionLocal()
    
    try:
        # Load the JSON file
        with open(json_filepath, 'r') as file:
            data = json.load(file)

        # Iterate through the JSON data
        for item in data:
            c_name = item.get("cancer_name")
            
            # Check if the cancer record already exists to prevent primary key errors
            existing_cancer = db.query(Cancer).filter(Cancer.name == c_name).first()
            if not existing_cancer:
                new_cancer = Cancer(name=c_name)
                db.add(new_cancer)
                db.flush() # Pushes the new cancer to the DB so the foreign key can use it immediately
            
            # Loop through and add the related information
            details = item.get("details", [])
            for detail in details:
                new_info = Information(
                    cancer_name=c_name,
                    info_type=detail.get("info_type"),
                    info_content=detail.get("info_content")
                )
                db.add(new_info)

        # Commit the transaction to save all changes
        db.commit()
        print(f"Successfully inserted data from '{json_filepath}'")

    except FileNotFoundError:
        print(f"Error: Could not find the file '{json_filepath}'")
    except json.JSONDecodeError:
        print("Error: The file does not contain valid JSON.")
    except Exception as e:
        # If anything goes wrong, rollback the transaction to keep the database clean
        db.rollback()
        print(f"An error occurred during database insertion: {e}")
    finally:
        # Always close the session when done
        db.close()

# Run the function
if __name__ == "__main__":
    insert_json('_dummy_data.json')
