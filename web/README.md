# Surveyer Frontend

A comprehensive survey platform built with Next.js 15, TypeScript, and Shadcn UI. This frontend interfaces with a Spring Boot backend to provide role-based survey creation and response functionality.

## Features

### 🎯 Role-Based Access Control
- **Creators**: Create, manage, and analyze surveys
- **Respondents**: Participate in available surveys

### 📊 Survey Management
- Create surveys with multiple question types
- Question types: Text, Single Choice, Multiple Choice
- Activate/deactivate surveys
- Delete surveys
- Real-time survey statistics

### 📝 Survey Taking
- Responsive survey interface
- Support for all question types
- Form validation
- Success confirmation

### 🎨 Modern UI/UX
- Built with Shadcn UI components
- Fully responsive design
- Dark/light mode support
- Toast notifications
- Loading states and error handling

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **Form Handling**: React Hook Form with Zod validation
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Notifications**: Sonner

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Running Spring Boot backend on port 8080

### Installation

1. **Navigate to the web directory**:
   ```bash
   cd web
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env.local` file in the web directory:
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:8080
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
web/
├── src/
│   ├── app/                 # Next.js app router pages
│   │   ├── auth/           # Authentication pages
│   │   ├── creator/        # Creator-specific pages
│   │   ├── respondent/     # Respondent-specific pages
│   │   └── layout.tsx      # Root layout
│   ├── components/         # Reusable components
│   │   ├── ui/            # Shadcn UI components
│   │   └── Navigation.tsx  # Main navigation
│   ├── contexts/          # React contexts
│   │   └── AuthContext.tsx # Authentication context
│   ├── services/          # API service layer
│   │   └── surveyService.ts # Survey API calls
│   ├── types/             # TypeScript type definitions
│   │   └── index.ts       # Main types
│   └── lib/               # Utility functions
│       ├── api.ts         # Axios configuration
│       └── utils.ts       # General utilities
├── components.json        # Shadcn UI configuration
├── tailwind.config.ts     # Tailwind CSS configuration
└── package.json          # Dependencies and scripts
```

## User Roles & Features

### 👨‍💼 Creator Role
- **Dashboard**: Overview of surveys and statistics
- **Create Survey**: Build surveys with multiple question types
- **Manage Surveys**: Edit, activate/deactivate, delete surveys
- **View Responses**: Analyze survey responses and data
- **Survey Settings**: Configure survey parameters

### 👥 Respondent Role
- **Browse Surveys**: View available active surveys
- **Take Surveys**: Participate in surveys with intuitive interface
- **Submit Responses**: Submit answers with validation
- **Success Feedback**: Confirmation after successful submission

## API Integration

The frontend communicates with the Spring Boot backend through a well-defined API layer:

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Survey Endpoints
- `GET /api/surveys` - Get all active surveys
- `GET /api/surveys/my` - Get current user's surveys
- `POST /api/surveys` - Create new survey
- `PUT /api/surveys/{id}` - Update survey
- `DELETE /api/surveys/{id}` - Delete survey

### Question Endpoints
- `POST /api/questions/survey/{surveyId}` - Add question to survey
- `PUT /api/questions/{questionId}` - Update question
- `DELETE /api/questions/{questionId}` - Delete question

### Response Endpoints
- `POST /api/responses/survey/{surveyId}` - Submit survey response
- `GET /api/responses/survey/{surveyId}` - Get survey responses

## Question Types

### 1. Text Response
- Free-form text input
- Textarea for longer responses
- Required field validation

### 2. Single Choice
- Radio button selection
- One option selectable
- Option validation

### 3. Multiple Choice
- Checkbox selection
- Multiple options selectable
- Minimum selection validation

## Authentication Flow

1. **Registration**: Users choose between Creator or Respondent roles
2. **Login**: JWT token-based authentication
3. **Token Storage**: Secure token storage in localStorage
4. **Auto-redirect**: Automatic redirects based on authentication state
5. **Role Guards**: Pages protected based on user roles

## Error Handling

- **Network Errors**: Graceful handling of API failures
- **Validation Errors**: Form validation with clear error messages
- **404 Errors**: Proper error pages for missing resources
- **403 Errors**: Access denied for unauthorized actions

## Responsive Design

The application is fully responsive and works across:
- **Desktop**: Full feature set with optimal layout
- **Tablet**: Adapted layouts for medium screens
- **Mobile**: Touch-friendly interface for small screens

## Performance Features

- **Code Splitting**: Automatic code splitting with Next.js
- **Image Optimization**: Next.js Image component for optimized loading
- **Static Generation**: Pre-rendered pages where possible
- **Client-side Routing**: Fast navigation with Next.js router

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Add new Shadcn components
npx shadcn@latest add [component-name]
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8080` |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Troubleshooting

### Common Issues

1. **API Connection Issues**:
   - Ensure backend is running on port 8080
   - Check CORS configuration in backend
   - Verify API URL in environment variables

2. **Authentication Issues**:
   - Clear localStorage and try logging in again
   - Check JWT token expiration
   - Verify backend authentication endpoints

3. **Build Issues**:
   - Clear `.next` directory: `rm -rf .next`
   - Reinstall dependencies: `rm -rf node_modules && npm install`
   - Check TypeScript errors: `npm run build`

## License

This project is licensed under the MIT License.
