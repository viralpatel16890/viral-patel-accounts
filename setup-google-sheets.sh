#!/bin/bash

# Google Sheets Setup Script for viral-patel-accounts
# Run this on your server to configure real Google Sheets integration

echo "🔧 Google Sheets Setup for accounts.viralpatelstudio.in"
echo ""

# Check if .env file exists
if [ ! -f "/var/www/accounts.viralpatelstudio.in/.env" ]; then
    echo "✅ .env file exists"
    ENV_FILE="/var/www/accounts.viralpatelstudio.in/.env"
else
    echo "⚠️  Creating new .env file"
    ENV_FILE="/var/www/accounts.viralpatelstudio.in/.env"
    touch $ENV_FILE
fi

echo ""
echo "📝 Add these lines to $ENV_FILE:"
echo ""
echo "# Google Sheets Configuration"
echo "GOOGLE_SHEETS_SPREADSHEET_ID=your-spreadsheet-id-here"
echo "GOOGLE_SHEETS_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com"
echo "GOOGLE_SHEETS_PRIVATE_KEY=\"-----BEGIN PRIVATE KEY-----"
echo "Your-Private-Key-Content-Here"
echo "-----END PRIVATE KEY-----\""
echo ""

echo "🔄 Steps to complete setup:"
echo "1. Replace the values above with your actual Google Sheets credentials"
echo "2. Restart the server: systemctl restart node-server (or whatever service name you use)"
echo "3. Test the sync endpoint"
echo ""

echo "📋 Google Sheets Setup Checklist:"
echo "□ Create Google Cloud Service Account"
echo "□ Download JSON key file"
echo "□ Copy private key from JSON file"
echo "□ Get service account email"
echo "□ Share Google Sheet with service account email"
echo "□ Add credentials to .env file"
echo "□ Restart server"
echo ""

echo "💡 After setup, your entries will sync in real-time!"
