import getSpreadsheetData from '../spreadsheet';

async function main() {
  const data = await getSpreadsheetData('config/credentials.json', '19v4zuIp_mQevrB4-9Bdbw68KlDq3niK5kNXTMbrW-jU', '설문지 응답 시트1!A2:ZZ');
  console.log(data);
}

main();
