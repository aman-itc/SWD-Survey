import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

async def seed_questions():
    # Clear existing questions
    await db.survey_questions.delete_many({})
    
    # Existing 7 questions from the survey
    questions = [
        {
            "id": "q1",
            "question_number": 1,
            "question_text": "How much is ITC biscuits monthly Sales (including all sources of purchase)?",
            "question_type": "single",
            "options": [
                {"value": "<Rs 1k", "label": "<Rs 1k"},
                {"value": "Rs 1k-5k", "label": "Rs 1k-5k"},
                {"value": "Rs.5k-20k", "label": "Rs.5k-20k"},
                {"value": "Rs.20k-1L", "label": "Rs.20k-1L"},
                {"value": "Rs.1L +", "label": "Rs.1L +"}
            ],
            "is_mandatory": True,
            "has_conditional_input": False,
            "conditional_trigger": None,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "q2",
            "question_number": 2,
            "question_text": "How much is the total monthly biscuits category sales for the outlet (All sources of purchase, all national/regional players)?",
            "question_type": "single",
            "options": [
                {"value": "<Rs.20K", "label": "<Rs.20K"},
                {"value": "Rs.20k - 1L", "label": "Rs.20k - 1L"},
                {"value": "Rs.1L – 5L", "label": "Rs.1L – 5L"},
                {"value": "Rs.5L +", "label": "Rs.5L +"}
            ],
            "is_mandatory": True,
            "has_conditional_input": False,
            "conditional_trigger": None,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "q3",
            "question_number": 3,
            "question_text": "How much is ITC ND monthly Sales (including all sources of purchase)?",
            "question_type": "single",
            "options": [
                {"value": "<Rs.5k", "label": "<Rs.5k"},
                {"value": "Rs.5k-20k", "label": "Rs.5k-20k"},
                {"value": "Rs.20k-1L", "label": "Rs.20k-1L"},
                {"value": "Rs.1L +", "label": "Rs.1L +"}
            ],
            "is_mandatory": True,
            "has_conditional_input": False,
            "conditional_trigger": None,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "q4",
            "question_number": 4,
            "question_text": "How much is ND sales for the SWD (All sources, all national/regional players)?",
            "question_type": "single",
            "options": [
                {"value": "<Rs.20K", "label": "<Rs.20K"},
                {"value": "Rs.20k - 1L", "label": "Rs.20k - 1L"},
                {"value": "Rs.1L – 5L", "label": "Rs.1L – 5L"},
                {"value": "Rs.5L +", "label": "Rs.5L +"}
            ],
            "is_mandatory": True,
            "has_conditional_input": False,
            "conditional_trigger": None,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "q5",
            "question_number": 5,
            "question_text": "Is the SWD part of any competition loyalty program? (Select all that apply)",
            "question_type": "multi",
            "options": [
                {"value": "Britannia", "label": "Britannia"},
                {"value": "Nestle", "label": "Nestle"},
                {"value": "HUL", "label": "HUL"},
                {"value": "Others", "label": "Others"}
            ],
            "is_mandatory": True,
            "has_conditional_input": True,
            "conditional_trigger": "Others",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "q6",
            "question_number": 6,
            "question_text": "Is the outlet a category handler for the following? (Select all that apply)",
            "question_type": "multi",
            "options": [
                {"value": "Atta", "label": "Atta"},
                {"value": "Snacks", "label": "Snacks"},
                {"value": "Confectionery", "label": "Confectionery"},
                {"value": "Soaps", "label": "Soaps"},
                {"value": "Agarbatti", "label": "Agarbatti"},
                {"value": "Cigarettes", "label": "Cigarettes"}
            ],
            "is_mandatory": True,
            "has_conditional_input": False,
            "conditional_trigger": None,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "q7",
            "question_number": 7,
            "question_text": "Why is the SWD not purchasing significant quantity from WD? (Select all that apply)",
            "question_type": "multi",
            "options": [
                {"value": "Credit related", "label": "Credit related"},
                {"value": "High Purchase from Alternate Channel", "label": "High Purchase from Alternate Channel"},
                {"value": "Loyalty of competition & not present in Shubh Labh", "label": "Loyalty of competition & not present in Shubh Labh"},
                {"value": "Low demand/Sell out led", "label": "Low demand/Sell out led"},
                {"value": "Delivery Issues", "label": "Delivery Issues"},
                {"value": "Relationship issue", "label": "Relationship issue"},
                {"value": "Retailer tagged as SWD", "label": "Retailer tagged as SWD"},
                {"value": "Scheme communication not adequate", "label": "Scheme communication not adequate"}
            ],
            "is_mandatory": True,
            "has_conditional_input": True,
            "conditional_trigger": "Relationship issue",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.survey_questions.insert_many(questions)
    print(f"✓ Seeded {len(questions)} questions into database")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_questions())
    print("✓ Question seeding complete!")
