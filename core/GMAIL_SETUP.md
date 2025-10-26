# Gmail API Setup for Email Notifications

To enable the email notification feature, you need to set up Gmail API credentials.

## Steps to Setup Gmail API:

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Create a new project or select an existing one

2. **Enable Gmail API**
   - In your project, go to "APIs & Services" → "Library"
   - Search for "Gmail API" and enable it

3. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Choose "Desktop app" as the application type
   - Click "Create"

4. **Download Credentials**
   - Click "Download JSON"
   - Rename the downloaded file to `credentials.json`
   - Place it in the root directory of this project

5. **Add to .gitignore**
   Make sure these files are in your `.gitignore`:
   ```
   credentials.json
   token.json
   ```

## First Run

When you first try to send an email, the system will:
1. Open a browser window for Google authentication
2. Ask you to log in with your Google account
3. Grant permissions to send emails
4. Save the credentials in `token.json`

**Note**: The email notification feature will send emails from the authenticated Google account to the doctor's email address specified in the code (currently: aayush418.patel@gmail.com)

