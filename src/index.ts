import { promises as fs } from 'fs';
import { Client } from "@notionhq/client"
import getSpreadsheetData from "./spreadsheet";
import getCreateNotionPageConfig from './notionPageDesign';

async function readJsonFile(path: string): Promise<any> {
  return JSON.parse((await fs.readFile(path)).toString())
}

async function main() {
  const { notionSecretKey } = await readJsonFile('config/secret.json');
  const notion = new Client({ auth: notionSecretKey });

  const { spreadsheetId, range, notionPageId } = await readJsonFile('config/config.json');
  const spreadsheetData = await getSpreadsheetData('config/google-credentials.json', spreadsheetId, range);

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
      const [dateStr, _, blahBlah, email, name] = row;
      const date = new Date((Date as any)(dateStr));
      return { date, name, email, blahBlah };
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
    .map(({ name, email, blahBlah }) => {
      return notion.pages.create(getCreateNotionPageConfig(notionPageId, name, email, blahBlah));
    });
  const successCount = (await Promise.all(notionPageCreationPromises)).length;
  console.log(`created ${successCount} new profile page(s)`);
}

main()
  .catch(err => console.log(err));
