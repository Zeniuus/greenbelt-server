import { promises as fs } from 'fs';
import { google } from 'googleapis';

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
export async function getGoogleApiClient(credentialsPath: string): Promise<any> {
  const credentialsBuffer = await fs.readFile(credentialsPath);
  const credentials = JSON.parse(credentialsBuffer.toString());
  const jwtClient = new google.auth.JWT(
    credentials.client_email,
    undefined,
    credentials.private_key,
    [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive',
    ],
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
