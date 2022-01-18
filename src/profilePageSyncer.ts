import * as fs from 'fs';
import { Client } from "@notionhq/client"
import { drive_v3, google, sheets_v4 } from 'googleapis';
import AWS from 'aws-sdk';
import { getGoogleApiClient } from "./googleApis";
import getCreateNotionPageConfig from './notionPageDesign';

const { notionSecretKey } = readJsonFile('config/secret.json');
const { spreadsheetId, range, notionPageId } = readJsonFile('config/config.json');

export async function sync(): Promise<number> {
  const notion = new Client({ auth: notionSecretKey });

  const googleApiClient = await getGoogleApiClient('config/google-credentials.json');
  const sheets = google.sheets({ version: 'v4', auth: googleApiClient });
  const drive = google.drive({ version: 'v3', auth: googleApiClient });

  const spreadsheetData = await getSpreadsheetData(sheets, spreadsheetId, range);
  const targetPagesData = spreadsheetData
    .map(convertRowToNotionPageData)
    .filter(({ date }) => {
      const aDayBefore = new Date();
      aDayBefore.setDate(aDayBefore.getDate() - 1);
      return date > aDayBefore;
    });
  const existingNotionPages = (await notion.databases.query({
    database_id: notionPageId,
    filter: {
      or: targetPagesData.map((data) => {
        return {
          property: '이메일',
          text: {
            equals: data.email,
          },
        };
      }),
    },
  })).results;
  const notionPageCreationPromises = targetPagesData
    .filter(({ email }) => {
      return !existingNotionPages.find((notionPage) => {
        return (notionPage as any).properties.이메일.rich_text[0].text.content == email;
      });
    })
    .map((data) => {
      return Promise.all([
        uploadImageToS3(drive, data.profileImageGoogleDriveId),
        uploadImageToS3(drive, data.experienceImageGoogleDriveId),
        uploadImageToS3(drive, data.electionReasonImageGoogleDriveId),
      ]).then((imageUrls) => {
        const [profileImageUrl, experienceImageUrl, electionReasonImageUrl] = imageUrls;
        return notion.pages.create(getCreateNotionPageConfig({
          ...data,
          notionPageId,
          profileImageUrl,
          experienceImageUrl,
          electionReasonImageUrl,
        }));
      })
    });
  const successCount = (await Promise.all(notionPageCreationPromises)).length;
  return successCount
}

function readJsonFile(path: string): any {
  return JSON.parse(fs.readFileSync(path).toString());
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

async function uploadImageToS3(drive: drive_v3.Drive, googleDriveImageId: string | null): Promise<string | null> {
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
  const imageData = Buffer.from(await imageDataBlob.arrayBuffer());

  const s3 = new AWS.S3();
  const uploadResult = await s3.upload({
    Bucket: 'greenbelt-images',
    Key: imageName,
    Body: imageData,
  }).promise();
  return uploadResult.Location;
}

function convertRowToNotionPageData(row: string[]): any {
  const [
    dateStr,
    name,
    email,
    phoneNumber,
    nameAndElection,
    profileImageUrl,
    shortSummary,
    longSummary,
    experience,
    experienceImageUrl,
    electionReason,
    electionReasonImageUrl,
    mbti,
    favoriteMovieAndDrama,
    howToSpendWeekends,
    howToReduceStress,
    favoriteFood,
    respectingPeople,
    favoriteBooks,
    planAfterElected,
    openChatUrl,
  ] = row;
  const date = new Date((Date as any)(dateStr));

  const match1 = /\?id=(.+)$/.exec(profileImageUrl);
  let profileImageGoogleDriveId = null;
  if (match1) {
    profileImageGoogleDriveId = match1[1];
  }
  const match2 = /\?id=(.+)$/.exec(experienceImageUrl);
  let experienceImageGoogleDriveId = null;
  if (match2) {
    experienceImageGoogleDriveId = match2[1];
  }
  const match3 = /\?id=(.+)$/.exec(electionReasonImageUrl);
  let electionReasonImageGoogleDriveId = null;
  if (match3) {
    electionReasonImageGoogleDriveId = match3[1];
  }

  return {
    date,
    name,
    email,
    phoneNumber,
    nameAndElection,
    profileImageGoogleDriveId,
    shortSummary,
    longSummary,
    experience,
    experienceImageGoogleDriveId,
    electionReason,
    electionReasonImageGoogleDriveId,
    mbti,
    favoriteMovieAndDrama,
    howToSpendWeekends,
    howToReduceStress,
    favoriteFood,
    respectingPeople,
    favoriteBooks,
    planAfterElected,
    openChatUrl,
  };
}
