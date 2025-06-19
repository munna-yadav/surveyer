# Survey API Testing Guide

This guide provides comprehensive information for testing all endpoints in the Survey Management System.

## Base URL
```
http://localhost:8080
```

## Authentication

The API uses JWT (JSON Web Token) for authentication. After login, include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 1. Authentication Endpoints

### 1.1 Register User
**Route:** `POST /api/auth/register`
**Authentication:** Not required
**Description:** Create a new user account

```json
{
  "username": "survey_creator",
  "email": "creator@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "CREATOR"
}e
```

**Response:**
```json
{
  "message": "User registered successfully"
}
```

### 1.2 Login User
**Route:** `POST /api/auth/login`
**Authentication:** Not required
**Description:** Login and get JWT token

```json
{
  "username": "survey_creator",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "survey_creator",
  "email": "creator@example.com",
  "name": "John Doe",
  "role": "CREATOR"
}
```

---

## 2. User Profile Endpoints

### 2.1 Get Current User
**Route:** `GET /api/user/me`
**Authentication:** Required
**Description:** Get current authenticated user information

**Response:**
```json
{
  "id": 1,
  "username": "survey_creator",
  "email": "creator@example.com",
  "name": "John Doe",
  "role": "CREATOR",
  "createdAt": "2024-01-15T10:30:00"
}
```

---

## 3. Survey Management Endpoints

### 3.1 Create Survey
**Route:** `POST /api/surveys`
**Authentication:** Required
**Description:** Create a new survey

```json
{
  "title": "Customer Satisfaction Survey",
  "description": "Help us improve our services by answering a few questions about your experience.",
  "isActive": false
}
```

**Response:**
```json
{
  "id": 1,
  "title": "Customer Satisfaction Survey",
  "description": "Help us improve our services by answering a few questions about your experience.",
  "isActive": false,
  "createdAt": "2024-01-15T10:30:00",
  "createdByUsername": "survey_creator",
  "questions": []
}
```

### 3.2 Get All Active Surveys (Public)
**Route:** `GET /api/surveys`
**Authentication:** Not required
**Description:** Get all published/active surveys

**Response:**
```json
[
  {
    "id": 1,
    "title": "Customer Satisfaction Survey",
    "description": "Help us improve our services...",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00",
    "createdByUsername": "survey_creator",
    "questions": [...]
  }
]
```

### 3.3 Get My Surveys
**Route:** `GET /api/surveys/my`
**Authentication:** Required
**Description:** Get surveys created by the current user

### 3.4 Get Survey by ID
**Route:** `GET /api/surveys/{id}`
**Authentication:** Required
**Description:** Get specific survey details
**Example:** `GET /api/surveys/1`

### 3.5 Get Active Survey by ID (Public)
**Route:** `GET /api/surveys/{id}/public`
**Authentication:** Not required
**Description:** Get active survey for public access
**Example:** `GET /api/surveys/1/public`

### 3.6 Update Survey
**Route:** `PUT /api/surveys/{id}`
**Authentication:** Required
**Description:** Update survey details
**Example:** `PUT /api/surveys/1`

```json
{
  "title": "Updated Customer Satisfaction Survey",
  "description": "Updated description for our customer satisfaction survey.",
  "isActive": true
}
```

### 3.7 Publish Survey
**Route:** `POST /api/surveys/{id}/publish`
**Authentication:** Required
**Description:** Publish/activate a survey
**Example:** `POST /api/surveys/1/publish`

### 3.8 Delete Survey (Soft Delete)
**Route:** `DELETE /api/surveys/{id}`
**Authentication:** Required
**Description:** Deactivate a survey
**Example:** `DELETE /api/surveys/1`

### 3.9 Get Survey Count
**Route:** `GET /api/surveys/count`
**Authentication:** Required
**Description:** Get total number of surveys created by current user

**Response:**
```json
5
```

---

## 4. Question Management Endpoints

### 4.1 Add Text Question to Survey
**Route:** `POST /api/questions/survey/{surveyId}`
**Authentication:** Required
**Description:** Add a text question to a survey
**Example:** `POST /api/questions/survey/1`

```json
{
  "questionText": "What do you like most about our product?",
  "type": "TEXT",
  "questionOrder": 1
}
```

### 4.2 Add Single Choice Question with Options
**Route:** `POST /api/questions/survey/{surveyId}`
**Authentication:** Required
**Description:** Add a single choice question with options
**Example:** `POST /api/questions/survey/1`

```json
{
  "questionText": "How satisfied are you with our product?",
  "type": "SINGLE_CHOICE",
  "questionOrder": 2,
  "options": [
    {
      "optionText": "Very Satisfied"
    },
    {
      "optionText": "Satisfied"
    },
    {
      "optionText": "Neutral"
    },
    {
      "optionText": "Dissatisfied"
    },
    {
      "optionText": "Very Dissatisfied"
    }
  ]
}
```

### 4.3 Add Multiple Choice Question with Options
**Route:** `POST /api/questions/survey/{surveyId}`
**Authentication:** Required
**Description:** Add a multiple choice question with options
**Example:** `POST /api/questions/survey/1`

```json
{
  "questionText": "Which features do you use most? (Select all that apply)",
  "type": "MULTIPLE_CHOICE",
  "questionOrder": 3,
  "options": [
    {
      "optionText": "Dashboard"
    },
    {
      "optionText": "Reports"
    },
    {
      "optionText": "Analytics"
    },
    {
      "optionText": "User Management"
    },
    {
      "optionText": "API Access"
    }
  ]
}
```

**Response:**
```json
{
  "id": 1,
  "questionText": "Which features do you use most? (Select all that apply)",
  "type": "MULTIPLE_CHOICE",
  "questionOrder": 3,
  "options": [
    {
      "id": 1,
      "optionText": "Dashboard"
    },
    {
      "id": 2,
      "optionText": "Reports"
    },
    {
      "id": 3,
      "optionText": "Analytics"
    },
    {
      "id": 4,
      "optionText": "User Management"
    },
    {
      "id": 5,
      "optionText": "API Access"
    }
  ]
}
```

### 4.4 Update Question
**Route:** `PUT /api/questions/{questionId}`
**Authentication:** Required
**Description:** Update an existing question
**Example:** `PUT /api/questions/1`

```json
{
  "questionText": "Updated: How would you rate our customer service?",
  "type": "SINGLE_CHOICE",
  "questionOrder": 1,
  "options": [
    {
      "optionText": "Excellent"
    },
    {
      "optionText": "Good"
    },
    {
      "optionText": "Average"
    },
    {
      "optionText": "Poor"
    }
  ]
}
```

### 4.5 Add Option to Existing Question
**Route:** `POST /api/questions/{questionId}/options`
**Authentication:** Required
**Description:** Add a new option to an existing question
**Example:** `POST /api/questions/1/options`

```json
{
  "optionText": "Not Applicable"
}
```

### 4.6 Get Questions by Survey
**Route:** `GET /api/questions/survey/{surveyId}`
**Authentication:** Not required
**Description:** Get all questions for a specific survey
**Example:** `GET /api/questions/survey/1`

### 4.7 Delete Question
**Route:** `DELETE /api/questions/{questionId}`
**Authentication:** Required
**Description:** Delete a question from a survey
**Example:** `DELETE /api/questions/1`

---

## 5. Survey Response Endpoints

### 5.1 Submit Survey Response
**Route:** `POST /api/responses/submit`
**Authentication:** Not required
**Description:** Submit a response to a survey

```json
{
  "surveyId": 1,
  "respondentEmail": "respondent@example.com",
  "answers": [
    {
      "questionId": 1,
      "answerText": "I love the intuitive design and easy navigation."
    },
    {
      "questionId": 2,
      "selectedOptionIds": [1]
    },
    {
      "questionId": 3,
      "selectedOptionIds": [1, 2, 3]
    }
  ]
}
```

**Response:**
```json
{
  "id": 1,
  "surveyId": 1,
  "respondentEmail": "respondent@example.com",
  "submittedAt": "2024-01-15T14:30:00",
  "answers": [
    {
      "id": 1,
      "questionId": 1,
      "answerText": "I love the intuitive design and easy navigation.",
      "selectedOptionIds": null
    },
    {
      "id": 2,
      "questionId": 2,
      "answerText": null,
      "selectedOptionIds": [1]
    },
    {
      "id": 3,
      "questionId": 3,
      "answerText": null,
      "selectedOptionIds": [1, 2, 3]
    }
  ]
}
```

### 5.2 Get Survey Responses (Admin)
**Route:** `GET /api/responses/survey/{surveyId}`
**Authentication:** Required
**Description:** Get all responses for a specific survey (survey creator only)
**Example:** `GET /api/responses/survey/1`

### 5.3 Get Response by ID
**Route:** `GET /api/responses/{responseId}`
**Authentication:** Required
**Description:** Get a specific response by ID
**Example:** `GET /api/responses/1`

### 5.4 Get Response Count for Survey
**Route:** `GET /api/responses/survey/{surveyId}/count`
**Authentication:** Not required
**Description:** Get the total number of responses for a survey
**Example:** `GET /api/responses/survey/1/count`

**Response:**
```json
15
```

### 5.5 Get Answers by Question
**Route:** `GET /api/responses/question/{questionId}/answers`
**Authentication:** Required
**Description:** Get all answers for a specific question
**Example:** `GET /api/responses/question/1/answers`

---

## 6. Health Check

### 6.1 Health Check
**Route:** `GET /api/health`
**Authentication:** Not required
**Description:** Check if the API is running

**Response:**
```json
{
  "status": "UP"
}
```

---

## 7. Complete Testing Workflow

### Step 1: User Registration and Authentication
```bash
# 1. Register a new user
POST /api/auth/register
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "name": "Test User",
  "role": "CREATOR"
}

# 2. Login to get JWT token
POST /api/auth/login
{
  "username": "testuser",
  "password": "password123"
}

# 3. Get current user info
GET /api/user/me
Authorization: Bearer <jwt_token>
```

### Step 2: Create Survey
```bash
# 1. Create a new survey
POST /api/surveys
Authorization: Bearer <jwt_token>
{
  "title": "Product Feedback Survey",
  "description": "We value your feedback about our product.",
  "isActive": false
}
# Note the returned survey ID (e.g., surveyId: 1)
```

### Step 3: Add Questions
```bash
# 1. Add a text question
POST /api/questions/survey/1
Authorization: Bearer <jwt_token>
{
  "questionText": "What do you like most about our product?",
  "type": "TEXT",
  "questionOrder": 1
}

# 2. Add a single choice question
POST /api/questions/survey/1
Authorization: Bearer <jwt_token>
{
  "questionText": "How would you rate our product overall?",
  "type": "SINGLE_CHOICE",
  "questionOrder": 2,
  "options": [
    {"optionText": "1 - Poor"},
    {"optionText": "2 - Fair"},
    {"optionText": "3 - Good"},
    {"optionText": "4 - Very Good"},
    {"optionText": "5 - Excellent"}
  ]
}

# 3. Add a multiple choice question
POST /api/questions/survey/1
Authorization: Bearer <jwt_token>
{
  "questionText": "Which features would you like to see improved?",
  "type": "MULTIPLE_CHOICE",
  "questionOrder": 3,
  "options": [
    {"optionText": "User Interface"},
    {"optionText": "Performance"},
    {"optionText": "Documentation"},
    {"optionText": "Customer Support"},
    {"optionText": "Mobile App"}
  ]
}
```

### Step 4: Publish Survey
```bash
# Publish the survey to make it active
POST /api/surveys/1/publish
Authorization: Bearer <jwt_token>
```

### Step 5: Test Survey Response
```bash
# Submit a response to the survey
POST /api/responses/submit
{
  "surveyId": 1,
  "respondentEmail": "respondent@example.com",
  "answers": [
    {
      "questionId": 1,
      "answerText": "I love the intuitive design and easy navigation."
    },
    {
      "questionId": 2,
      "selectedOptionIds": [5]
    },
    {
      "questionId": 3,
      "selectedOptionIds": [6, 7]
    }
  ]
}
```

### Step 6: View Results
```bash
# 1. Get survey responses (as creator)
GET /api/responses/survey/1
Authorization: Bearer <jwt_token>

# 2. Get response count
GET /api/responses/survey/1/count

# 3. Get my surveys
GET /api/surveys/my
Authorization: Bearer <jwt_token>
```

---

## 8. Question Types Guide

### TEXT Questions
- Use for open-ended responses
- Only requires `answerText` in response
- No options needed

### SINGLE_CHOICE Questions
- Use for selecting one option
- Requires `options` array when creating
- Use `selectedOptionIds` with single ID in response

### MULTIPLE_CHOICE Questions
- Use for selecting multiple options
- Requires `options` array when creating
- Use `selectedOptionIds` with array of IDs in response

---

## 9. Error Handling

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## 10. Testing Tips

1. **Save IDs**: Always note the IDs returned from POST requests for use in subsequent requests
2. **JWT Token**: Copy the token from login response and use it in Authorization header
3. **Question Order**: Use sequential order numbers for better organization
4. **Email Validation**: Use valid email formats for respondent emails
5. **Survey State**: Remember to publish surveys before collecting responses
6. **Permission Checks**: Only survey creators can view their survey responses

---

This guide covers all the endpoints needed to test the complete survey management workflow. Start with authentication, create surveys, add questions, publish, and collect responses! 