import { promises as fs } from 'fs';
import { google } from 'googleapis';

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getGoogleApiClient(credentials: any): Promise<any> {
  const jwtClient = new google.auth.JWT(
    credentials.client_email,
    undefined,
    credentials.private_key,
    ['https://www.googleapis.com/auth/spreadsheets'],
  );
  return new Promise((resolve, reject) => {
    jwtClient.authorize((err, tokens) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        resolve(jwtClient);
      }
    });
  });
}

export default async function getSpreadsheetData(credentialsPath: string, spreadsheetId: string, range: string): Promise<any[][]> {
  const credentialsBuffer = await fs.readFile(credentialsPath);
  const credentials = JSON.parse(credentialsBuffer.toString());

  const googleApiClient = await getGoogleApiClient(credentials);

  const sheets = google.sheets({ version: 'v4', auth: googleApiClient });
  try {
    const { data: { values } } = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });
    return values!;
  } catch (err) {
    console.log(`The API returned an error: ${err}`);
    throw err;
  }
}
