# Search UI

A modern search interface with AI chat functionality built with Next.js.

## Features

- Clean, light-colored UI
- Company and founder search functionality
- Company cards displaying company name, founder/CEO, designation, and LinkedIn
- AI chat window that opens on the right side
- Responsive design
- Backend API with synthetic data generation

## Getting Started

### Backend Setup

1. Navigate to the backend directory:
```bash
cd ../backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Start the FastAPI server:
```bash
uvicorn main:app --reload --port 8000
```

The backend API will be available at `http://localhost:8000`
- API docs: `http://localhost:8000/docs`

### Frontend Setup

1. Install the dependencies:
```bash
npm install
```

2. (Optional) Create a `.env.local` file to configure the API URL:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `app/` - Next.js app router pages and layouts
- `components/` - React components (SearchBar, ChatWindow, CompanyCard)
- `app/globals.css` - Global styles
- `app/page.module.css` - Main page styles

## API Endpoints

- `GET /api/companies` - Get list of companies (20 items)
- `GET /api/companies/search?query=<search_term>` - Search companies by name, founder, or designation

## Next Steps

- Replace synthetic data with database integration
- Integrate the AI chat with your AI backend service
- Add more detailed company information

