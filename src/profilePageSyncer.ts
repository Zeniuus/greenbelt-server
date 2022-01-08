import { promises as fs } from 'fs';
import { Client } from "@notionhq/client"
import { drive_v3, google, sheets_v4 } from 'googleapis';
import { getGoogleApiClient } from "./googleApis";
import getCreateNotionPageConfig from './notionPageDesign';
import temporaryImageHolder from './temporaryImageHolder';

export async function sync(): Promise<number> {
  const { notionSecretKey } = await readJsonFile('config/secret.json');
  const notion = new Client({ auth: notionSecretKey });

  const { spreadsheetId, range, notionPageId } = await readJsonFile('config/config.json');
  const googleApiClient = await getGoogleApiClient('config/google-credentials.json');

  const sheets = google.sheets({ version: 'v4', auth: googleApiClient });
  const drive = google.drive({ version: 'v3', auth: googleApiClient });

  const spreadsheetData = await getSpreadsheetData(sheets, spreadsheetId, range);
  const existingNotionPages = (await notion.databases.query({
    database_id: notionPageId,
    sorts: [
      {
        property: 'Created',
        direction: 'descending',
      },
    ],
    page_size: 100,
  })).results;
  const notionPageCreationPromises = spreadsheetData
    .map((row) => {
      const [dateStr, _, blahBlah, email, name, profileImageUrl] = row;

      const date = new Date((Date as any)(dateStr));

      const match = /\?id=(.+)$/.exec(profileImageUrl);
      let googleDriveImageId = null;
      if (match) {
        googleDriveImageId = match[1];
      }

      return { date, name, email, blahBlah, googleDriveImageId };
    })
    .filter(({ date }) => {
      const aDayBefore = new Date();
      aDayBefore.setDate(aDayBefore.getDate() - 1);
      return date > aDayBefore;
    })
    .filter(({ email }) => {
      return !existingNotionPages.find((notionPage) => {
        return (notionPage as any).properties.Email.rich_text[0].text.content == email;
      });
    })
    .map(({ name, email, blahBlah, googleDriveImageId }) => {
      return generateTemporaryImageUrl(drive, googleDriveImageId)
        .then((imageUrl) => {
          return notion.pages.create(getCreateNotionPageConfig(notionPageId, name, email, blahBlah, imageUrl));
        })
    });
  const successCount = (await Promise.all(notionPageCreationPromises)).length;
  return successCount
}

async function readJsonFile(path: string): Promise<any> {
  return JSON.parse((await fs.readFile(path)).toString())
}

async function getSpreadsheetData(sheets: sheets_v4.Sheets, spreadsheetId: string, range: string): Promise<any[][]> {
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

async function generateTemporaryImageUrl(drive: drive_v3.Drive, googleDriveImageId: string | null): Promise<string | null> {
  if (!googleDriveImageId) {
    return Promise.resolve(null);
  }

  const imageDataBlob = await drive.files.get({
    fileId: googleDriveImageId,
    alt: 'media',
  }, {
    responseType: 'blob'
  })
    .then((res) => {
      return res.data as any as Blob;
    });
  const imageMimeType = /^image\/(.+)$/.exec(imageDataBlob.type)![1];
  const imageName = `${encodeURIComponent(googleDriveImageId)}.${imageMimeType}`;
  const imageUrl = `http://k8s-suhwandev-31d7cacf43-1245390296.ap-northeast-2.elb.amazonaws.com/images/${imageName}`;
  const imageData = Buffer.from(await imageDataBlob.arrayBuffer());
  temporaryImageHolder.put(imageName, { mimeType: imageMimeType, buffer: imageData });
  return imageUrl;
}
