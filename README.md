# Graffiti App

A social platform for graffiti artists to showcase their work, build their reputation, and connect with the graffiti community.

## Features

- Digital "black books" for each artist
- Upload and categorize artwork (tags, throw-ups, pieces, etc.)
- Social features (follow, like, comment)
- Monthly competitions
- Premium memberships (no ads!)

## Tech Stack

- **Backend:** Python (FastAPI), PostgreSQL
- **Frontend:** React
- **Storage:** AWS S3 (for images)
- **Authentication:** JWT tokens

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL
- Git

### Installation

1. Clone the repository:
```bash
git clone git@github.com:YOUR-USERNAME/graffiti-app.git
cd graffiti-app
```

2. Set up the backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. Set up the frontend:
```bash
cd frontend
npm install
```

### Running the Application

1. Start the backend:
```bash
cd backend
uvicorn app.main:app --reload
```

2. Start the frontend:
```bash
cd frontend
npm start
```

## Project Structure

```
graffiti-app/
├── backend/          # FastAPI backend
│   ├── app/         # Application code
│   └── tests/       # Backend tests
├── frontend/        # React frontend
│   ├── src/        # Source code
│   └── public/     # Static files
├── docs/           # Documentation
└── scripts/        # Utility scripts
```

## Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'Add amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## License

This project is licensed under the MIT License.