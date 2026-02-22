# Comprehensive Prompt to Rebuild: Low PDO SWD Survey Application

Use this prompt on any AI coding platform to recreate this exact application.

---

## PROMPT START

Build a **Low PDO SWD Survey Application** - a full-stack web application for collecting survey responses from retail outlets. The app has two user types: **Area Executives** (who take surveys) and **Administrators** (who manage and view results).

---

## TECH STACK
- **Frontend:** React with Tailwind CSS and Shadcn/UI components
- **Backend:** FastAPI (Python)
- **Database:** MongoDB

---

## USER ROLES

### 1. Area Executive (No login required)
- Selects outlet details from cascading dropdowns
- Completes a 7-question survey
- Can see section completion progress

### 2. Administrator (Login required)
- Credentials: Email: `vickyvikas@itc.in` | Password: `vickyvikas`
- Views all survey responses with filters
- Exports data to Excel
- Manages survey questions (Add, Edit, Delete)

---

## PAGE STRUCTURE

### Page 1: Homepage (`/`)
- Title: **"Low PDO SWD Survey"** (large, gradient text)
- Show 3 stat cards: "1,632 Total Outlets", "5 Active Branches", "Live System Status"
- Two tabs: **"Area Executive"** and **"Administrator"**
- Area Executive tab: "Begin Survey" button → navigates to `/survey`
- Administrator tab: "Access Dashboard" button → navigates to `/admin/login`
- Modern gradient background (purple/blue), animated floating elements
- Footer with 4 feature icons: Real-time Analytics, Progress Tracking, Export Reports, Dynamic Forms

### Page 2: Survey Page (`/survey`) - TWO STEP PROCESS

#### Step 1: Outlet Details Selection
- Title: "Outlet Details"
- 4 cascading dropdowns (each selection populates the next):
  1. **Branch** → fetches from `/api/branches`
  2. **Section** → fetches from `/api/sections/{branch}`
  3. **WD Destination** (label: "Please select your WD and DS") → fetches from `/api/wd-destinations/{section}`
  4. **DMS ID - Name** → fetches from `/api/dms-ids/{section}/{wd_destination}`
- Show selected DMS in a green confirmation box
- Show **Section Completion Progress** bar with percentage (fetches from `/api/section-completion/{section}`)
- "Continue to Survey" button → proceeds to Step 2

#### Step 2: Survey Questions (Dynamic from Database)
- Title: "Survey Questions" with subtitle "All questions are mandatory"
- Fetch questions from `/api/admin/questions`
- Render each question with alternating gradient background colors (blue, purple, green, amber, rose, cyan, indigo)
- Question types:
  - **single**: Radio button group
  - **multi**: Checkbox group
- For questions with `has_conditional_input: true`, show a textarea when the `conditional_trigger` option is selected
- "Submit Survey" button → POST to `/api/survey/submit`
- On success: Show thank you page with checkmark icon and "Return to Home" button

### Page 3: Admin Login (`/admin/login`)
- Email and password input fields
- "Sign In" button
- Validate against hardcoded credentials
- On success: Navigate to `/admin/dashboard`

### Page 4: Admin Dashboard (`/admin/dashboard`)
- Header with "Admin Dashboard" title and "Logout" button
- Two tabs: **"Survey Responses"** and **"Manage Questions"**

#### Tab 1: Survey Responses
- Filter dropdowns: Branch, Section
- Stats cards showing total responses, responses by branch
- Table displaying all survey responses with columns: ID, Branch, Section, WD Destination, DMS ID, Submitted At
- "Export to Excel" button → downloads Excel file from `/api/admin/export`

#### Tab 2: Manage Questions
- "Add New Question" button (opens modal/form)
- List all questions from database showing: Question Number, Question Text, Type, Options count, Mandatory status
- Each question has "Edit" and "Delete" buttons
- Edit modal: Update question text, type, options, mandatory status, conditional input settings
- Delete: Confirmation dialog before removing

---

## DATABASE SCHEMA

### Collection: `survey_data` (Outlet Information)
```json
{
  "branch": "WAHM",
  "section": "WAAH",
  "wd_destination": "123456 x Distributor Name",
  "dms_id_name": "789012 - Customer Name"
}
```

### Collection: `survey_questions`
```json
{
  "id": "q1",
  "question_number": 1,
  "question_text": "How much is ITC biscuits monthly Sales?",
  "question_type": "single",
  "options": [
    {"value": "<Rs 1k", "label": "<Rs 1k"},
    {"value": "Rs 1k-5k", "label": "Rs 1k-5k"}
  ],
  "is_mandatory": true,
  "has_conditional_input": false,
  "conditional_trigger": null,
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### Collection: `survey_responses`
```json
{
  "id": "uuid",
  "branch": "WAHM",
  "section": "WAAH",
  "wd_destination": "123456 x Distributor Name",
  "dms_id_name": "789012 - Customer Name",
  "responses": {
    "q1": "Rs 1k-5k",
    "q2": "<Rs.20K",
    "q5": ["Britannia", "Nestle"],
    "q5_conditional": null,
    "q7": ["Credit related", "Relationship issue"],
    "q7_conditional": "Detailed reason text here"
  },
  "submitted_at": "timestamp"
}
```

---

## DEFAULT SURVEY QUESTIONS (Seed these into database)

### Question 1 (Single Select)
- **Text:** "How much is ITC biscuits monthly Sales (including WD and other sources of purchase)?"
- **Options:** `<Rs 1k`, `Rs 1k-5k`, `Rs.5k-20k`, `Rs.20k-1L`, `Rs.1L +`
- **Mandatory:** Yes

### Question 2 (Single Select)
- **Text:** "How much is the total monthly biscuits category sales for the outlet (All sources of purchase, all national/regional players)?"
- **Options:** `<Rs.20K`, `Rs.20k - 1L`, `Rs.1L – 5L`, `Rs.5L +`
- **Mandatory:** Yes

### Question 3 (Single Select)
- **Text:** "How much is ITC Yippee Noodles monthly Sales (including all sources of purchase)?"
- **Options:** `<Rs.5k`, `Rs.5k-20k`, `Rs.20k-1L`, `Rs.1L +`
- **Mandatory:** Yes

### Question 4 (Single Select)
- **Text:** "How much is the overall noodles category sales for the SWD (All sources, all national/regional players)?"
- **Options:** `<Rs.20K`, `Rs.20k - 1L`, `Rs.1L – 5L`, `Rs.5L +`
- **Mandatory:** Yes

### Question 5 (Multi Select with Conditional Input)
- **Text:** "Is this outlet enrolled in any competition loyalty program (Select all that apply)"
- **Options:** `Britannia`, `Nestle`, `HUL`, `Others`
- **Mandatory:** Yes
- **Conditional Input:** Yes - show textarea when "Others" is selected

### Question 6 (Multi Select)
- **Text:** "Is the outlet a category handler for the following? (Select all that apply)"
- **Options:** `Atta`, `Snacks`, `Confectionery`, `Soaps`, `Agarbatti`, `Cigarettes`
- **Mandatory:** Yes

### Question 7 (Multi Select with Conditional Input)
- **Text:** "Why is the SWD not purchasing significant quantity from WD? (Select all that apply)"
- **Options:** `Credit related`, `High Purchase from Alternate Channel`, `Loyalty of competition & not present in Shubh Labh`, `Low demand/Sell out led`, `Delivery Issues`, `Relationship issue`, `Retailer tagged as SWD`, `Scheme communication not adequate`
- **Mandatory:** Yes
- **Conditional Input:** Yes - show textarea when "Relationship issue" is selected

---

## API ENDPOINTS

### Public Endpoints (No Auth)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/branches` | Get all unique branches |
| GET | `/api/sections/{branch}` | Get sections for a branch |
| GET | `/api/wd-destinations/{section}` | Get WD destinations for a section |
| GET | `/api/dms-ids/{section}/{wd_destination}` | Get DMS IDs for WD destination |
| GET | `/api/section-completion/{section}` | Get completion % for section |
| POST | `/api/survey/submit` | Submit survey response |

### Admin Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/login` | Admin authentication |
| GET | `/api/admin/responses` | Get all responses (with optional branch/section filters) |
| GET | `/api/admin/stats` | Get dashboard statistics |
| GET | `/api/admin/export` | Export responses to Excel |
| GET | `/api/admin/questions` | Get all survey questions |
| POST | `/api/admin/questions` | Create new question |
| PUT | `/api/admin/questions/{id}` | Update question |
| DELETE | `/api/admin/questions/{id}` | Delete question |

---

## SAMPLE OUTLET DATA (Load into survey_data collection)

The app requires outlet data with these 5 branches: `WAHM`, `WBHO`, `WMUM`, `WNAG`, `WPUN`

Each record has:
- `branch`: Branch code
- `section`: Section code under the branch
- `wd_destination`: Format "WD Code x DS Name" (e.g., "123456 x ABC Distributors")
- `dms_id_name`: Format "DMS ID - Customer Name" (e.g., "789012 - XYZ Store")

Create at least 20-50 sample records across different branches and sections for testing.

---

## UI/UX SPECIFICATIONS

### Color Scheme
- Primary gradient: Blue (#667eea) to Purple (#764ba2)
- Background: Gradient with animated floating circles (white/blue/purple with blur)
- Cards: White with subtle shadows
- Question cards: Alternating gradient backgrounds (blue, purple, green, amber, rose, cyan, indigo tints)

### Components
- Use Shadcn/UI components: Card, Button, Tabs, Select, RadioGroup, Checkbox, Input, Textarea, Label
- All interactive elements must have `data-testid` attributes for testing

### Responsive Design
- Mobile-friendly with proper breakpoints
- Tab labels shortened on mobile screens

### Animations
- Fade-in and slide-up animations on page load
- Hover effects on buttons (scale transform)
- Pulse animation on background elements
- Smooth transitions on all interactive elements

---

## IMPORTANT IMPLEMENTATION NOTES

1. **Cascading Dropdowns:** Each dropdown should reset the subsequent dropdowns when changed
2. **Dynamic Questions:** Survey questions must be fetched from database, NOT hardcoded
3. **Completion Tracking:** Calculate as (unique DMS IDs with responses / total DMS IDs in section) × 100
4. **Excel Export:** Generate columns dynamically based on current questions in database
5. **Survey Submission:** Accept dynamic fields using flexible model (Pydantic ConfigDict with extra='allow')
6. **MongoDB ObjectId:** Always exclude `_id` from API responses to avoid serialization errors

---

## PROMPT END

---

*This prompt contains complete specifications to rebuild the Low PDO SWD Survey application from scratch.*
