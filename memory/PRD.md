# ITC Survey Application - Product Requirements Document

## Original Problem Statement
Build a survey website with the following features:
1. A landing page where an "Area Executive" can select from cascading dropdowns: Branch -> Section -> WD Destination -> DMS ID
2. The dropdown data is provided in Excel files (Final SWD List.xlsx, later updated to 1600 Outlets.xlsx)
3. After selection, present a 7-question survey with single-select, multi-select, and conditional text input options
4. All survey questions are mandatory
5. Homepage with two tabs: "Area Executive" (leads to survey) and "Administrator"
6. Admin login page with credentials: vickyvikas@itc.in / vickyvikas
7. Admin Panel for viewing survey results with charts, filtering, and Excel export
8. Dynamic question management - admin can add, edit, delete questions

## Core Requirements
- Two-step survey process (outlet selection -> questions)
- Section completion percentage tracking
- Survey responses saved to MongoDB
- Admin authentication
- Export survey responses to Excel
- Full CRUD for survey questions

## Technical Architecture

### Backend (FastAPI + MongoDB)
- **Server:** `/app/backend/server.py`
- **Data Loading:** `/app/backend/load_new_data.py` (1600 Outlets.xlsx)
- **Question Seeding:** `/app/backend/seed_questions.py`

### Frontend (React + Shadcn/UI + Tailwind)
- **Router:** `/app/frontend/src/App.js`
- **Survey Page:** `/app/frontend/src/pages/SurveyPage.js` (2-step form with dynamic questions)
- **Admin Dashboard:** `/app/frontend/src/pages/AdminDashboard.js`
- **Question Management:** `/app/frontend/src/pages/QuestionManagement.js`
- **Admin Login:** `/app/frontend/src/pages/AdminLoginPage.js`
- **Homepage:** `/app/frontend/src/pages/HomePage.js`

### Database Collections
- `survey_data`: Outlet information (branch, section, wd_destination, dms_id_name)
- `survey_responses`: Submitted surveys with dynamic question responses
- `survey_questions`: Survey question definitions (CRUD-enabled)

### Key API Endpoints
- `GET /api/branches` - List all branches
- `GET /api/sections/{branch}` - Get sections for branch
- `GET /api/wd-destinations/{section}` - Get WD destinations for section
- `GET /api/dms-ids/{section}/{wd_destination}` - Get DMS IDs
- `GET /api/section-completion/{section}` - Get completion percentage
- `POST /api/survey/submit` - Submit survey (accepts dynamic fields)
- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/responses` - Get survey responses with filters
- `GET /api/admin/export` - Export to Excel (dynamic columns)
- `GET /api/admin/questions` - List all questions
- `POST /api/admin/questions` - Create question
- `PUT /api/admin/questions/{id}` - Update question
- `DELETE /api/admin/questions/{id}` - Delete question

## What's Been Implemented

### Completed Features (December 2025)
- [x] Homepage with Area Executive and Administrator tabs
- [x] 4-level cascading dropdown selection (Branch -> Section -> WD Destination -> DMS ID)
- [x] Two-step survey process
- [x] Section completion percentage tracking
- [x] Dynamic survey questions loaded from database
- [x] Single-select (radio) and multi-select (checkbox) question types
- [x] Conditional text input for "Others" and "Relationship issue" options
- [x] Survey submission with dynamic field storage
- [x] Admin login with hardcoded credentials
- [x] Admin dashboard with response viewing and filtering
- [x] Dynamic Excel export with question columns
- [x] Question management CRUD (add, edit, delete questions)
- [x] 7 initial questions seeded into database

### Bug Fixes Applied
- Fixed runtime error in SurveyPage.js - questions were hardcoded instead of dynamically loaded
- Updated backend to accept dynamic survey submissions (ConfigDict extra='allow')
- Fixed exception handling in update/delete question endpoints

## Testing Status
- Backend: 100% (19/19 tests passed)
- Frontend: 100% (all features verified)
- Test file: `/app/backend/tests/test_survey_api.py`

## Admin Credentials
- Email: vickyvikas@itc.in
- Password: vickyvikas

## Backlog / Future Enhancements
- [ ] Implement proper JWT authentication for admin
- [ ] Add user roles and permissions
- [ ] Dashboard analytics with charts
- [ ] Bulk import/export for questions
- [ ] Email notifications on survey submission
- [ ] Refactor SurveyPage.js into smaller components (OutletSelection, DynamicQuestionForm)
