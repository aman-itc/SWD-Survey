"""
ITC Survey API Tests
Tests for:
- Survey cascading dropdowns (Branch -> Section -> WD Destination -> DMS ID)
- Admin login authentication
- Survey questions CRUD
- Survey submission
- Admin responses and stats
"""

import pytest
import requests
import os
import uuid
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test admin credentials
ADMIN_EMAIL = "vickyvikas@itc.in"
ADMIN_PASSWORD = "vickyvikas"


class TestHealthCheck:
    """Health check - verify API is running"""
    
    def test_api_root(self):
        """Test API root endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert data["message"] == "ITC Survey API"
        print("✅ API root endpoint working")


class TestCascadingDropdowns:
    """Test cascading dropdown flow: Branch -> Section -> WD Destination -> DMS ID"""
    
    def test_get_branches(self):
        """Test GET /api/branches - returns list of branches"""
        response = requests.get(f"{BASE_URL}/api/branches")
        assert response.status_code == 200
        data = response.json()
        assert "branches" in data
        assert isinstance(data["branches"], list)
        assert len(data["branches"]) > 0
        print(f"✅ Found {len(data['branches'])} branches: {data['branches']}")
    
    def test_get_sections_by_branch(self):
        """Test GET /api/sections/{branch} - returns sections for a branch"""
        # First get a branch
        branches_response = requests.get(f"{BASE_URL}/api/branches")
        branches = branches_response.json()["branches"]
        assert len(branches) > 0
        
        test_branch = branches[0]
        response = requests.get(f"{BASE_URL}/api/sections/{test_branch}")
        assert response.status_code == 200
        data = response.json()
        assert "sections" in data
        assert isinstance(data["sections"], list)
        print(f"✅ Found {len(data['sections'])} sections for branch {test_branch}")
    
    def test_get_wd_destinations_by_section(self):
        """Test GET /api/wd-destinations/{section} - returns WD destinations for a section"""
        # Get a branch and section first
        branches = requests.get(f"{BASE_URL}/api/branches").json()["branches"]
        sections = requests.get(f"{BASE_URL}/api/sections/{branches[0]}").json()["sections"]
        
        if len(sections) > 0:
            test_section = sections[0]
            response = requests.get(f"{BASE_URL}/api/wd-destinations/{test_section}")
            assert response.status_code == 200
            data = response.json()
            assert "wd_destinations" in data
            assert isinstance(data["wd_destinations"], list)
            print(f"✅ Found {len(data['wd_destinations'])} WD destinations for section {test_section}")
        else:
            pytest.skip("No sections available for testing")
    
    def test_get_dms_ids_by_wd_destination(self):
        """Test GET /api/dms-ids/{section}/{wd_destination} - returns DMS IDs"""
        # Navigate through the cascade
        branches = requests.get(f"{BASE_URL}/api/branches").json()["branches"]
        sections = requests.get(f"{BASE_URL}/api/sections/{branches[0]}").json()["sections"]
        
        if len(sections) > 0:
            test_section = sections[0]
            wd_destinations = requests.get(f"{BASE_URL}/api/wd-destinations/{test_section}").json()["wd_destinations"]
            
            if len(wd_destinations) > 0:
                test_wd = wd_destinations[0]
                # URL encode the WD destination
                import urllib.parse
                encoded_wd = urllib.parse.quote(test_wd, safe='')
                response = requests.get(f"{BASE_URL}/api/dms-ids/{test_section}/{encoded_wd}")
                assert response.status_code == 200
                data = response.json()
                assert "dms_ids" in data
                assert isinstance(data["dms_ids"], list)
                print(f"✅ Found {len(data['dms_ids'])} DMS IDs for WD {test_wd}")
            else:
                pytest.skip("No WD destinations available")
        else:
            pytest.skip("No sections available")
    
    def test_get_section_completion(self):
        """Test GET /api/section-completion/{section} - returns completion stats"""
        branches = requests.get(f"{BASE_URL}/api/branches").json()["branches"]
        sections = requests.get(f"{BASE_URL}/api/sections/{branches[0]}").json()["sections"]
        
        if len(sections) > 0:
            test_section = sections[0]
            response = requests.get(f"{BASE_URL}/api/section-completion/{test_section}")
            assert response.status_code == 200
            data = response.json()
            assert "section" in data
            assert "total_dms_ids" in data
            assert "completed_surveys" in data
            assert "completion_percentage" in data
            print(f"✅ Section {test_section}: {data['completion_percentage']}% complete ({data['completed_surveys']}/{data['total_dms_ids']})")
        else:
            pytest.skip("No sections available")


class TestAdminAuthentication:
    """Test admin login functionality"""
    
    def test_admin_login_success(self):
        """Test POST /api/admin/login - successful login"""
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "email" in data
        assert data["email"] == ADMIN_EMAIL
        assert data["token"].startswith("admin_token_")
        print(f"✅ Admin login successful for {ADMIN_EMAIL}")
    
    def test_admin_login_invalid_credentials(self):
        """Test POST /api/admin/login - invalid credentials returns 401"""
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"email": "wrong@email.com", "password": "wrongpassword"}
        )
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        print("✅ Invalid credentials correctly rejected with 401")
    
    def test_admin_login_wrong_password(self):
        """Test POST /api/admin/login - correct email, wrong password"""
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"email": ADMIN_EMAIL, "password": "wrongpassword"}
        )
        assert response.status_code == 401
        print("✅ Wrong password correctly rejected with 401")


class TestSurveyQuestions:
    """Test survey questions API - CRUD operations"""
    
    def test_get_all_questions(self):
        """Test GET /api/admin/questions - returns all survey questions"""
        response = requests.get(f"{BASE_URL}/api/admin/questions")
        assert response.status_code == 200
        data = response.json()
        assert "questions" in data
        assert isinstance(data["questions"], list)
        
        # Verify expected 7 seeded questions exist
        questions = data["questions"]
        assert len(questions) >= 7, f"Expected at least 7 questions, got {len(questions)}"
        
        # Verify question structure
        for q in questions:
            assert "id" in q
            assert "question_number" in q
            assert "question_text" in q
            assert "question_type" in q
            assert "is_mandatory" in q
            assert "options" in q
        
        print(f"✅ Found {len(questions)} questions in database")
    
    def test_questions_have_correct_types(self):
        """Verify questions have correct types: single, multi"""
        response = requests.get(f"{BASE_URL}/api/admin/questions")
        questions = response.json()["questions"]
        
        # Count question types
        single_count = sum(1 for q in questions if q["question_type"] == "single")
        multi_count = sum(1 for q in questions if q["question_type"] == "multi")
        
        assert single_count >= 4, f"Expected at least 4 single-select questions, got {single_count}"
        assert multi_count >= 3, f"Expected at least 3 multi-select questions, got {multi_count}"
        print(f"✅ Question types: {single_count} single-select, {multi_count} multi-select")
    
    def test_conditional_questions_exist(self):
        """Verify Q5 and Q7 have conditional input triggers"""
        response = requests.get(f"{BASE_URL}/api/admin/questions")
        questions = response.json()["questions"]
        
        q5 = next((q for q in questions if q["question_number"] == 5), None)
        q7 = next((q for q in questions if q["question_number"] == 7), None)
        
        assert q5 is not None, "Question 5 not found"
        assert q5["has_conditional_input"] == True, "Q5 should have conditional input"
        assert q5["conditional_trigger"] == "Others", "Q5 conditional trigger should be 'Others'"
        
        assert q7 is not None, "Question 7 not found"
        assert q7["has_conditional_input"] == True, "Q7 should have conditional input"
        assert q7["conditional_trigger"] == "Relationship issue", "Q7 conditional trigger should be 'Relationship issue'"
        
        print("✅ Conditional questions (Q5, Q7) correctly configured")
    
    def test_create_question(self):
        """Test POST /api/admin/questions - create a new question"""
        test_question = {
            "question_number": 99,
            "question_text": f"TEST_Question_{uuid.uuid4().hex[:8]}",
            "question_type": "single",
            "options": [
                {"value": "opt1", "label": "Option 1"},
                {"value": "opt2", "label": "Option 2"}
            ],
            "is_mandatory": True,
            "has_conditional_input": False,
            "conditional_trigger": ""
        }
        
        response = requests.post(
            f"{BASE_URL}/api/admin/questions",
            json=test_question
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "question" in data
        assert data["question"]["question_text"] == test_question["question_text"]
        
        created_id = data["question"]["id"]
        print(f"✅ Created test question with ID: {created_id}")
        
        # Cleanup - delete the test question
        delete_response = requests.delete(f"{BASE_URL}/api/admin/questions/{created_id}")
        assert delete_response.status_code == 200
        print("✅ Test question cleaned up")
    
    def test_delete_question_not_found(self):
        """Test DELETE /api/admin/questions/{id} - non-existent question"""
        response = requests.delete(f"{BASE_URL}/api/admin/questions/nonexistent-id-12345")
        assert response.status_code == 404
        print("✅ Delete non-existent question correctly returns 404")


class TestSurveySubmission:
    """Test survey submission functionality"""
    
    def test_submit_survey_success(self):
        """Test POST /api/survey/submit - successful submission"""
        # Get valid cascading values
        branches = requests.get(f"{BASE_URL}/api/branches").json()["branches"]
        sections = requests.get(f"{BASE_URL}/api/sections/{branches[0]}").json()["sections"]
        wd_destinations = requests.get(f"{BASE_URL}/api/wd-destinations/{sections[0]}").json()["wd_destinations"]
        
        import urllib.parse
        encoded_wd = urllib.parse.quote(wd_destinations[0], safe='')
        dms_ids = requests.get(f"{BASE_URL}/api/dms-ids/{sections[0]}/{encoded_wd}").json()["dms_ids"]
        
        submission = {
            "branch": branches[0],
            "section": sections[0],
            "wd_destination": wd_destinations[0],
            "dms_id_name": dms_ids[0]["dms_id_name"] if dms_ids else "TEST_DMS_ID",
            "q1": "<Rs 1k",
            "q2": "<Rs.20K",
            "q3": "<Rs.5k",
            "q4": "<Rs.20K",
            "q5": ["Britannia", "Nestle"],
            "q6": ["Atta", "Snacks"],
            "q7": ["Credit related", "Delivery Issues"]
        }
        
        response = requests.post(
            f"{BASE_URL}/api/survey/submit",
            json=submission
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "id" in data
        assert data["message"] == "Survey submitted successfully"
        print(f"✅ Survey submitted successfully with ID: {data['id']}")


class TestAdminResponses:
    """Test admin response viewing and filtering"""
    
    def test_get_all_responses(self):
        """Test GET /api/admin/responses - returns all survey responses"""
        response = requests.get(f"{BASE_URL}/api/admin/responses")
        assert response.status_code == 200
        data = response.json()
        assert "responses" in data
        assert "total" in data
        assert isinstance(data["responses"], list)
        print(f"✅ Found {data['total']} survey responses")
    
    def test_get_responses_with_branch_filter(self):
        """Test GET /api/admin/responses - with branch filter"""
        branches = requests.get(f"{BASE_URL}/api/branches").json()["branches"]
        
        response = requests.get(f"{BASE_URL}/api/admin/responses?branch={branches[0]}")
        assert response.status_code == 200
        data = response.json()
        assert "responses" in data
        
        # Verify all responses match the filter
        for r in data["responses"]:
            assert r["branch"] == branches[0]
        print(f"✅ Branch filter working - {data['total']} responses for {branches[0]}")
    
    def test_get_admin_stats(self):
        """Test GET /api/admin/stats - returns statistics"""
        response = requests.get(f"{BASE_URL}/api/admin/stats")
        assert response.status_code == 200
        data = response.json()
        assert "total_responses" in data
        assert "responses_by_branch" in data
        assert "recent_responses" in data
        print(f"✅ Stats: {data['total_responses']} total, {data['recent_responses']} recent")
    
    def test_export_responses(self):
        """Test GET /api/admin/export - exports Excel file"""
        response = requests.get(f"{BASE_URL}/api/admin/export")
        assert response.status_code == 200
        assert "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" in response.headers.get("content-type", "")
        assert len(response.content) > 0
        print(f"✅ Export working - received {len(response.content)} bytes")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
