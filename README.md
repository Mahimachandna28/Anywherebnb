# Anywherebnb 🏡
> A modern, fullstack Airbnb web application clone replicating Airbnb's signature design, user experience, and core booking/hosting workflows.

Built as an SDE Fullstack Assignment submission.

---

## 🛠️ Technical Stack
- **Frontend**: Next.js 14+ (App Router, TypeScript, Tailwind CSS, Lucide Icons, Date-fns)
- **Backend**: Python FastAPI (Uvicorn, SQLAlchemy ORM, Pydantic v2)
- **Database**: SQLite with relational schema enforcement (`PRAGMA foreign_keys = ON`)
- **Testing**: Pytest

---

## 📁 Repository Structure
```text
Anywherebnb/
├── backend/
│   ├── app/
│   │   ├── core/           # Config, SQLite database engine & session dependency
│   │   ├── models/         # SQLAlchemy ORM database models
│   │   ├── schemas/        # Pydantic validation and serialization schemas
│   │   ├── routers/        # FastAPI REST API endpoints
│   │   ├── services/       # Domain business logic (availability, pricing, search)
│   │   └── main.py         # FastAPI application entry point & CORS
│   ├── tests/              # Pytest automated test suite
│   ├── seed.py             # Database seeder CLI script
│   └── requirements.txt    # Python backend dependencies
├── frontend/
│   ├── src/
│   │   ├── app/            # Next.js App Router pages
│   │   ├── components/     # UI components (navbar, cards, modals, booking widget)
│   │   ├── context/        # React contexts (Auth/Role, Wishlist, Filters)
│   │   ├── hooks/          # Custom reusable React hooks
│   │   ├── lib/            # API client and formatting utilities
│   │   └── types/          # TypeScript domain type definitions
│   ├── tailwind.config.ts  # Airbnb brand design tokens & styling
│   └── package.json        # Frontend dependencies & scripts
└── README.md
```

---

## 🚀 Quick Setup Instructions

### Prerequisites
- Node.js v18+ & npm
- Python 3.10+

### Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
python seed.py
uvicorn app.main:app --reload --port 8000
```
Interactive API documentation will be available at:
`http://localhost:8000/api/docs`

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The application will be accessible at:
`http://localhost:3000`