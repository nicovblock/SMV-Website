"""
main.py — St. Michael's Vanguard Flask Server
Updated with /api/contact endpoint that writes to Google Sheets
"""

import os
import json
import datetime
from flask import Flask, request, jsonify, send_from_directory

# Google Sheets integration
import gspread
from google.oauth2.service_account import Credentials

app = Flask(__name__, static_folder=".", static_url_path="")

# ──────────────────────────────────────────────
# GOOGLE SHEETS CONFIGURATION
# ──────────────────────────────────────────────
# The service account credentials are stored as an environment variable
# in Cloud Run (not committed to GitHub — keeps your key safe).

SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
]

def get_sheets_client():
    """Authenticate with Google Sheets using service account credentials."""
    creds_json = os.environ.get("GOOGLE_SHEETS_CREDENTIALS")
    if not creds_json:
        raise RuntimeError("GOOGLE_SHEETS_CREDENTIALS env var is not set")
    
    creds_dict = json.loads(creds_json)
    credentials = Credentials.from_service_account_info(creds_dict, scopes=SCOPES)
    return gspread.authorize(credentials)

def append_to_sheet(name, email, message):
    """Append a contact form submission as a new row in Google Sheets."""
    client = get_sheets_client()
    
    # Open your spreadsheet by its ID (from the URL of your Google Sheet)
    # Example: https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit
    sheet_id = os.environ.get("GOOGLE_SHEET_ID")
    if not sheet_id:
        raise RuntimeError("GOOGLE_SHEET_ID env var is not set")
    
    spreadsheet = client.open_by_key(sheet_id)
    worksheet = spreadsheet.sheet1  # Uses the first sheet/tab
    
    # Append the row: Timestamp, Name, Email, Message
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    worksheet.append_row([timestamp, name, email, message])

# ──────────────────────────────────────────────
# ROUTES
# ──────────────────────────────────────────────

@app.route("/")
def home():
    return send_from_directory(".", "index.html")

@app.route("/billing")
def billing():
    return send_from_directory(".", "billing.html")

@app.route("/success")
def success():
    return send_from_directory(".", "success.html")


@app.route("/api/contact", methods=["POST"])
def contact():
    """
    Receives contact form submissions and writes them to Google Sheets.
    
    Expects JSON body:
    {
        "name": "John Doe",
        "email": "john@example.com",
        "message": "I'd like to learn more about the Vanguard."
    }
    """
    data = request.get_json(silent=True)
    
    # ── Validate input ──
    if not data:
        return jsonify({"error": "No data received"}), 400
    
    name = data.get("name", "").strip()
    email = data.get("email", "").strip()
    message = data.get("message", "").strip()
    
    if not name or not email or not message:
        return jsonify({"error": "All fields are required (name, email, message)"}), 400
    
    # Basic email format check
    if "@" not in email or "." not in email:
        return jsonify({"error": "Invalid email address"}), 400
    
    # ── Write to Google Sheets ──
    try:
        append_to_sheet(name, email, message)
    except Exception as e:
        app.logger.error(f"Failed to write to Google Sheets: {e}")
        return jsonify({"error": "Server error — please try again later"}), 500
    
    return jsonify({"success": True, "message": "Your message has been received. We will be in touch."}), 200


# ──────────────────────────────────────────────
# START SERVER
# ──────────────────────────────────────────────

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port, debug=False)
