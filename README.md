# Charlie Health Careers

## Run locally

1. Copy `.env.example` to `.env` and set a newly rotated Telegram bot token and chat ID.
2. Install dependencies with `npm install`.
3. Start the application server with `npm start`.
4. Open `http://localhost:4173`.

The server reads `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` only from the environment. Application submissions are sent to Telegram as a formatted message, and uploaded PDF, DOC, or DOCX resumes are sent as documents. Resume uploads are limited to 10 MB.

Do not put Telegram credentials in browser JavaScript or commit `.env`.