import { Client } from "@notionhq/client"

const notion = new Client({ auth: process.env.NOTION_KEY })
const pageId = 'd67612e43e624f43a3c7e7c51855a784'

async function addItem() {
  try {
    const response = await notion.pages.create({
      parent: {
        page_id: pageId,
      },
      properties: {
        title: [
          {
            type: 'text',
            text: {
              content: 'A new page title',
            },
          }
        ],
      },
      children: [
        {
          object: 'block',
          heading_2: {
            text: [
              {
                type: 'text',
                text: {
                  content: 'A new heading 2',
                },
              },
            ],
          },
        },
        {
          object: 'block',
          paragraph: {
            text: [
              {
                type: 'text',
                text: {
                  content: 'A new paragraph',
                },
              },
            ],
          },
        },
      ],
    });
    console.log(response)
    console.log("Success! Entry added.")
  } catch (error) {
    console.error(error.body)
  }
}

// addItem()

async function readItem() {
  try {
    const response = await notion.blocks.children.list({
      block_id: pageId,
    });
    console.log(response)
    console.log("Success! Entry added.")
  } catch (error) {
    console.error(error.body)
  }
}
readItem();