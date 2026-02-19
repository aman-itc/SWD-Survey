import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path
import openpyxl

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

async def load_excel_data():
    # Clear existing data
    await db.survey_data.delete_many({})
    
    # Load from the extracted data
    # This is a sample - you'll need to parse the actual Excel file
    sample_data = [
        {"branch": "WAHM", "section_code": "AH4001", "dms_customer_id": "AH21431ITC035SFA062500158", "dms_customer_name": "PATEL TRADERS_230544"},
        {"branch": "WAHM", "section_code": "AH4001", "dms_customer_id": "AH3193TRS253SFA072501667", "dms_customer_name": "BHAGY LAXMI JANRAL STOR"},
        {"branch": "WAHM", "section_code": "AH4002", "dms_customer_id": "AH312310TRS351IMP042501086", "dms_customer_name": "HITESH TRADERS"},
        {"branch": "WBHO", "section_code": "BHO001", "dms_customer_id": "BH3119CRM038967", "dms_customer_name": "EXE 23/24 OM PRAGATI KIRANA STORE AMONA"},
        {"branch": "WMUM", "section_code": "MU4001", "dms_customer_id": "MU332811ITC415134", "dms_customer_name": "MAHESH TOBACCO"},
        {"branch": "WPUN", "section_code": "PUR002", "dms_customer_id": "PU4037CRM003GB122", "dms_customer_name": "MINAR GOLI"},
    ]
    
    if sample_data:
        await db.survey_data.insert_many(sample_data)
        print(f"Loaded {len(sample_data)} records into database")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(load_excel_data())
    print("Data loading complete!")