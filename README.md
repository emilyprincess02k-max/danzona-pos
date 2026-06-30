# SHEDS POS powered by SHEDS Enterprise

This is the SHEDS POS powered by SHEDS Enterprise Point-of-Sale web application.

## Run locally

1. Create a virtual environment:
```bash
python -m venv .venv
```
2. Activate it:
- Windows PowerShell:
```powershell
.\.venv\Scripts\Activate.ps1
```
- macOS/Linux:
```bash
source .venv/bin/activate
```
3. Install dependencies:
```bash
pip install -r requirements.txt
```
4. Start the app:
```bash
python server.py
```
5. Open the app in your browser at `http://localhost:5000`

## Deploy to Render

1. Push this repo to GitHub.
2. Create a Render Web Service and connect the repository.
3. Use these settings:
   - Build command: `pip install -r requirements.txt`
   - Start command: `gunicorn server:app --bind 0.0.0.0:$PORT`
   - Environment variable: `SECRET_KEY`
4. Deploy and open the provided Render URL.

## Notes

- The app uses SQLite (`danzona_pos.db`) as its database.
- For production, consider using a managed database or backup strategy.

