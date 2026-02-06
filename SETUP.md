# Setup Instructions

Before running the application, you need to set up both the backend and frontend.

## Prerequisites

1. **PostgreSQL** - Make sure PostgreSQL is installed and running
2. **Python 3.8+** - For the FastAPI backend
3. **Node.js 18+** - For the Next.js frontend

## Backend Setup

### 1. Navigate to backend directory

```bash
cd C:\Users\admin\Desktop\WebChat-AI\backend
```

### 2. Create and activate virtual environment

```bash
python -m venv venv
venv\Scripts\activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Create PostgreSQL database

Open PostgreSQL and run:

```sql
CREATE DATABASE webchat_ai;
```

### 5. Configure environment variables

```bash
copy .env.example .env
```

Edit `.env` file and update these values:

- `DATABASE_URL`: Your PostgreSQL connection string (default is `postgresql://postgres:postgres@localhost:5432/webchat_ai`)
- `SMTP_USERNAME`: Your Gmail address
- `SMTP_PASSWORD`: Your Gmail App Password (see instructions below)
- `SMTP_FROM_EMAIL`: Your Gmail address

#### Gmail App Password Setup

1. Go to your Google Account: [https://myaccount.google.com](https://myaccount.google.com)
2. Navigate to Security → 2-Step Verification (enable if not already)
3. Scroll to "App passwords": [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
4. Select "Mail" and "Windows Computer"
5. Copy the generated 16-character password
6. Paste it in `.env` as `SMTP_PASSWORD`

### 6. Run the backend server

```bash
uvicorn main:app --reload --port 8000
```

The backend will run at `http://localhost:8000`
API docs available at `http://localhost:8000/docs`

## Frontend Setup

### 1. Navigate to landing directory

```bash
cd C:\Users\admin\Desktop\WebChat-AI\landing
```

### 2. Install dependencies (if not already installed)

```bash
npm install
```

### 3. Run the development server

```bash
npm run dev
```

The frontend will run at `http://localhost:3000`

## Testing the Complete Flow

1. Make sure both backend (port 8000) and frontend (port 3000) are running
2. Open browser to `http://localhost:3000`
3. Enter your email address in the form
4. Check your email inbox for the OTP code (6 digits)
5. Enter the OTP on the verification page
6. You should be redirected to the dashboard
7. Check PostgreSQL database:
   ```sql
   SELECT * FROM users;
   SELECT * FROM otp_codes;
   ```

## Troubleshooting

### Email not received?

- Check spam folder
- Verify SMTP credentials in `.env`
- Check backend console for errors
- Make sure Gmail App Password is correct (not your regular password)

### Database connection error?

- Ensure PostgreSQL is running
- Verify `DATABASE_URL` in `.env`
- Check if database `webchat_ai` exists

### Frontend can't connect to backend?

- Make sure backend is running on port 8000
- Check browser console for errors
- Verify Next.js proxy configuration in `next.config.ts`
