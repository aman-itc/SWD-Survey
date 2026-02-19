from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
import io
import xlsxwriter
import bcrypt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Models
class SurveyDataItem(BaseModel):
    branch: str
    section_code: str
    dms_customer_id: str
    dms_customer_name: str

class SurveyResponse(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    branch: str
    section_code: str
    dms_customer_id: str
    dms_customer_name: str
    q1_itc_biscuits_sales: str
    q2_total_biscuits_sales: str
    q3_itc_nd_sales: str
    q4_nd_sales_swd: str
    q5_loyalty_programs: List[str]
    q6_category_handlers: List[str]
    q7_not_purchasing_reasons: List[str]
    q7_relationship_issue_details: Optional[str] = None
    submitted_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SurveySubmission(BaseModel):
    branch: str
    section_code: str
    dms_customer_id: str
    dms_customer_name: str
    q1_itc_biscuits_sales: str
    q2_total_biscuits_sales: str
    q3_itc_nd_sales: str
    q4_nd_sales_swd: str
    q5_loyalty_programs: List[str]
    q6_category_handlers: List[str]
    q7_not_purchasing_reasons: List[str]
    q7_relationship_issue_details: Optional[str] = None

class AdminLogin(BaseModel):
    email: EmailStr
    password: str

class AdminResponse(BaseModel):
    token: str
    email: str

# Simple auth check
def verify_admin(email: str, password: str) -> bool:
    return email == "vickyvikas@itc.in" and password == "vickyvikas"

# Initialize survey data collection
@api_router.on_event("startup")
async def initialize_data():
    # Create indexes for faster queries
    await db.survey_responses.create_index("branch")
    await db.survey_responses.create_index("section_code")
    await db.survey_responses.create_index("submitted_at")

@api_router.get("/")
async def root():
    return {"message": "ITC Survey API"}

# Get unique branches
@api_router.get("/branches")
async def get_branches():
    try:
        branches = await db.survey_data.distinct("branch")
        return {"branches": sorted(branches)}
    except Exception as e:
        logging.error(f"Error fetching branches: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Get sections by branch
@api_router.get("/sections/{branch}")
async def get_sections(branch: str):
    try:
        sections = await db.survey_data.distinct("section_code", {"branch": branch})
        return {"sections": sorted(sections)}
    except Exception as e:
        logging.error(f"Error fetching sections: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Get customers by section
@api_router.get("/customers/{section_code}")
async def get_customers(section_code: str):
    try:
        customers = await db.survey_data.find(
            {"section_code": section_code},
            {"_id": 0, "dms_customer_id": 1, "dms_customer_name": 1}
        ).to_list(1000)
        return {"customers": customers}
    except Exception as e:
        logging.error(f"Error fetching customers: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Submit survey
@api_router.post("/survey/submit")
async def submit_survey(submission: SurveySubmission):
    try:
        response = SurveyResponse(**submission.model_dump())
        doc = response.model_dump()
        doc['submitted_at'] = doc['submitted_at'].isoformat()
        
        await db.survey_responses.insert_one(doc)
        return {"success": True, "message": "Survey submitted successfully", "id": response.id}
    except Exception as e:
        logging.error(f"Error submitting survey: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Admin login
@api_router.post("/admin/login")
async def admin_login(credentials: AdminLogin):
    if verify_admin(credentials.email, credentials.password):
        # Simple token (in production, use JWT)
        token = f"admin_token_{uuid.uuid4()}"
        return AdminResponse(token=token, email=credentials.email)
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")

# Get all survey responses with filters
@api_router.get("/admin/responses")
async def get_responses(
    branch: Optional[str] = None,
    section: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    try:
        query = {}
        if branch:
            query["branch"] = branch
        if section:
            query["section_code"] = section
        if start_date or end_date:
            query["submitted_at"] = {}
            if start_date:
                query["submitted_at"]["$gte"] = start_date
            if end_date:
                query["submitted_at"]["$lte"] = end_date
        
        responses = await db.survey_responses.find(query, {"_id": 0}).sort("submitted_at", -1).to_list(1000)
        return {"responses": responses, "total": len(responses)}
    except Exception as e:
        logging.error(f"Error fetching responses: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Get statistics
@api_router.get("/admin/stats")
async def get_stats():
    try:
        total = await db.survey_responses.count_documents({})
        
        # Responses by branch
        by_branch = await db.survey_responses.aggregate([
            {"$group": {"_id": "$branch", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}
        ]).to_list(100)
        
        # Recent responses count (last 7 days)
        from datetime import timedelta
        week_ago = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
        recent = await db.survey_responses.count_documents({
            "submitted_at": {"$gte": week_ago}
        })
        
        return {
            "total_responses": total,
            "responses_by_branch": [{
                "branch": item["_id"],
                "count": item["count"]
            } for item in by_branch],
            "recent_responses": recent
        }
    except Exception as e:
        logging.error(f"Error fetching stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Export to Excel
@api_router.get("/admin/export")
async def export_responses(
    branch: Optional[str] = None,
    section: Optional[str] = None
):
    try:
        query = {}
        if branch:
            query["branch"] = branch
        if section:
            query["section_code"] = section
        
        responses = await db.survey_responses.find(query, {"_id": 0}).to_list(10000)
        
        # Create Excel file in memory
        output = io.BytesIO()
        workbook = xlsxwriter.Workbook(output)
        worksheet = workbook.add_worksheet("Survey Responses")
        
        # Headers
        headers = [
            "ID", "Branch", "Section Code", "DMS Customer ID", "DMS Customer Name",
            "Q1: ITC Biscuits Sales", "Q2: Total Biscuits Sales", "Q3: ITC ND Sales",
            "Q4: ND Sales SWD", "Q5: Loyalty Programs", "Q6: Category Handlers",
            "Q7: Not Purchasing Reasons", "Q7: Relationship Issue Details", "Submitted At"
        ]
        
        for col, header in enumerate(headers):
            worksheet.write(0, col, header)
        
        # Data
        for row, response in enumerate(responses, start=1):
            worksheet.write(row, 0, response.get("id", ""))
            worksheet.write(row, 1, response.get("branch", ""))
            worksheet.write(row, 2, response.get("section_code", ""))
            worksheet.write(row, 3, response.get("dms_customer_id", ""))
            worksheet.write(row, 4, response.get("dms_customer_name", ""))
            worksheet.write(row, 5, response.get("q1_itc_biscuits_sales", ""))
            worksheet.write(row, 6, response.get("q2_total_biscuits_sales", ""))
            worksheet.write(row, 7, response.get("q3_itc_nd_sales", ""))
            worksheet.write(row, 8, response.get("q4_nd_sales_swd", ""))
            worksheet.write(row, 9, ", ".join(response.get("q5_loyalty_programs", [])))
            worksheet.write(row, 10, ", ".join(response.get("q6_category_handlers", [])))
            worksheet.write(row, 11, ", ".join(response.get("q7_not_purchasing_reasons", [])))
            worksheet.write(row, 12, response.get("q7_relationship_issue_details", ""))
            worksheet.write(row, 13, response.get("submitted_at", ""))
        
        workbook.close()
        output.seek(0)
        
        return StreamingResponse(
            output,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": "attachment; filename=survey_responses.xlsx"}
        )
    except Exception as e:
        logging.error(f"Error exporting data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()