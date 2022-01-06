import { promises as fs } from 'fs';
import { google } from 'googleapis';

async function main() {
  const credentialsBuffer = await fs.readFile('config/credentials.json');
  const credentials = JSON.parse(credentialsBuffer.toString());
  
  const googleApiClient = await getGoogleApiClient(credentials);
  
  const sheets = google.sheets({ version: 'v4', auth: googleApiClient });
  try {
    const { data } = await sheets.spreadsheets.values.get({
      spreadsheetId: '19v4zuIp_mQevrB4-9Bdbw68KlDq3niK5kNXTMbrW-jU',
      range: '설문지 응답 시트1!A2:ZZ',
    });
    console.log(data);
  } catch (err) {
    console.log(`The API returned an error: ${err}`);
  }
}

main();

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getGoogleApiClient(credentials: any): Promise<any> {
  const jwtClient = new google.auth.JWT(
    credentials.client_email,
    null,
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
