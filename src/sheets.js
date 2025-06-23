const { google } = require('googleapis');
const path = require('path');

const KEYFILEPATH = path.join(__dirname, '../credentials.json');
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

async function getAuthenticatedClient() {
    const auth = new google.auth.GoogleAuth({
        keyFile: KEYFILEPATH,
        scopes: SCOPES,
    });
    const client = await auth.getClient();
    return client;
}

async function readSheet(auth, spreadsheetId, range) {
    const sheets = google.sheets({ version: 'v4', auth });
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
    });
    return response.data.values;
}

async function updateSheet(auth, spreadsheetId, range, values) {
    const sheets = google.sheets({ version: 'v4', auth });
    await sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        resource: {
            values,
        },
    });
}

module.exports = {
    getAuthenticatedClient,
    readSheet,
    updateSheet
}; 