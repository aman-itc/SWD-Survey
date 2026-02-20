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

async def load_new_data():
    # Clear existing data
    await db.survey_data.delete_many({})
    
    # Load Excel file
    excel_file = ROOT_DIR / "1600_Outlets.xlsx"
    
    if not excel_file.exists():
        print(f"Excel file not found at {excel_file}")
        return
    
    wb = openpyxl.load_workbook(excel_file)
    ws = wb.active
    
    data_list = []
    
    # Get headers from first row
    headers = [cell.value for cell in ws[1]]
    print(f"Headers: {headers}")
    
    # Read data starting from row 2
    for row in ws.iter_rows(min_row=2, values_only=True):
        if row[0] and row[1] and row[2] and row[3]:  # Ensure all required fields exist
            data_list.append({
                "branch": str(row[0]).strip(),
                "section": str(row[1]).strip(),
                "wd_destination": str(row[2]).strip(),  # WD Destination Code x DS Name
                "dms_id_name": str(row[3]).strip()      # DMS ID - Name
            })
    
    if data_list:
        await db.survey_data.insert_many(data_list)
        print(f"✓ Loaded {len(data_list)} records into database")
    else:
        print("No data found in Excel file")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(load_new_data())
    print("✓ Data loading complete!")
