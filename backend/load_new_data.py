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
    
    # Headers are in row 2, data starts from row 3
    # Columns: Branch Code, Section, WD Code, DS Name, DMS Name, DMS ID
    for row in ws.iter_rows(min_row=3, values_only=True):
        if row[1] and row[2] and row[3] and row[4]:  # Ensure required fields exist
            # Combine WD Code + DS Name for the WD Destination
            wd_destination = f"{str(row[3]).strip()} {str(row[4]).strip()}"
            
            # Combine DMS Name + DMS ID for the DMS ID - Name
            dms_id_name = f"{str(row[6]).strip()} - {str(row[5]).strip()}" if row[6] and row[5] else ""
            
            if dms_id_name:
                data_list.append({
                    "branch": str(row[1]).strip(),
                    "section": str(row[2]).strip(),
                    "wd_destination": wd_destination,
                    "dms_id_name": dms_id_name
                })
    
    if data_list:
        await db.survey_data.insert_many(data_list)
        print(f"✓ Loaded {len(data_list)} records into database")
        print(f"Sample record: {data_list[0]}")
    else:
        print("No data found in Excel file")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(load_new_data())
    print("✓ Data loading complete!")
