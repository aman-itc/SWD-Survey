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
    
    # Load Excel file
    excel_file = ROOT_DIR / "Final_SWD_List.xlsx"
    
    if not excel_file.exists():
        print(f"Excel file not found at {excel_file}")
        return
    
    wb = openpyxl.load_workbook(excel_file)
    ws = wb.active
    
    data_list = []
    
    # Skip first 4 rows (empty rows and header) and read data from row 5
    for row in ws.iter_rows(min_row=5, values_only=True):
        if row[0] and row[1] and row[2] and row[3]:  # Ensure all required fields exist
            data_list.append({
                "branch": str(row[0]).strip(),
                "section_code": str(row[1]).strip(),
                "dms_customer_id": str(row[2]).strip(),
                "dms_customer_name": str(row[3]).strip()
            })
    
    if data_list:
        await db.survey_data.insert_many(data_list)
        print(f"Loaded {len(data_list)} records into database")
    else:
        print("No data found in Excel file")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(load_excel_data())
    print("Data loading complete!")
