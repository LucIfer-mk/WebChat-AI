# WebChat AI - Backend

FastAPI backend for email OTP authentication with PostgreSQL.

## Setup

1. **Install Python dependencies**:

   ```bash
   pip install -r requirements.txt
   ```

2. **Configure environment variables**:

   ```bash
   copy .env.example .env
   ```

   Edit `.env` and update:
   - `DATABASE_URL`: PostgreSQL connection string
   - `SMTP_USERNAME`: Your email address (for Gmail)
   - `SMTP_PASSWORD`: Your app password (not regular Gmail password)
   - `SMTP_FROM_EMAIL`: Your email address

3. **Set up PostgreSQL**:
   - Install PostgreSQL if not already installed
   - Create database:
     ```sql
     CREATE DATABASE webchat_ai;
     ```

4. **For Gmail SMTP**:
   - Enable 2-Step Verification in your Google Account
   - Generate an App Password: [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
   - Use the App Password in `.env` file

## Running the Server

```bash
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

API documentation: `http://localhost:8000/docs`

## API Endpoints

- `POST /api/auth/submit-email` - Submit email and receive OTP
- `POST /api/auth/verify-otp` - Verify OTP code
- `POST /api/auth/resend-otp` - Resend OTP to email
- `GET /health` - Health check

## Database Tables

- `users` - Stores user emails
- `otp_codes` - Stores OTP codes with expiration
