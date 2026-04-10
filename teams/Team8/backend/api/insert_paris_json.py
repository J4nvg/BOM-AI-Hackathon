import json
from sqlalchemy.orm import Session

# Import your database session and models
from api_sql_schema import SessionLocal, Cancer, Information

def insert_cancer_data(json_filepath: str):
    # Open a new database session
    db: Session = SessionLocal()
    
    try:
        # Load the JSON file (specifying utf-8 to handle any special characters safely)
        with open(json_filepath, 'r', encoding='utf-8') as file:
            data = json.load(file)

        # Access the root 'cancer_types' object
        cancer_types = data.get("cancer_types", {})

        for cancer_key, categories in cancer_types.items():
            # Clean up the name (e.g., "breast_cancer" -> "Breast Cancer")
            formatted_cancer_name = cancer_key.replace('_', ' ').title()
            
            # Check if the cancer record already exists
            existing_cancer = db.query(Cancer).filter(Cancer.name == formatted_cancer_name).first()
            if not existing_cancer:
                new_cancer = Cancer(name=formatted_cancer_name)
                db.add(new_cancer)
                db.flush() 
            
            # Loop through the categories (stats, facts, advice, expertise)
            for info_type, entries in categories.items():
                for entry in entries:
                    # Skip the empty placeholder templates in your JSON
                    if not entry.get("title") and not entry.get("text"):
                        continue
                    
                    # Convert the dictionary entry into a JSON string for the TEXT column
                    content_json_str = json.dumps(entry, ensure_ascii=False)
                    
                    # Create the new Information record
                    new_info = Information(
                        cancer_name=formatted_cancer_name,
                        info_type=info_type,  # e.g., 'stats'
                        info_content=content_json_str
                    )
                    db.add(new_info)

        # Commit the transaction to save all changes
        db.commit()
        print(f"Successfully inserted structured data from '{json_filepath}'!")

    except FileNotFoundError:
        print(f"Error: Could not find the file '{json_filepath}'")
    except json.JSONDecodeError:
        print("Error: The file does not contain valid JSON.")
    except Exception as e:
        # If anything goes wrong, rollback the transaction
        db.rollback()
        print(f"An error occurred during database insertion: {e}")
    finally:
        # Always close the session
        db.close()

# Run the function using your specific filename
if __name__ == "__main__":
    insert_cancer_data('draft_info.json')
