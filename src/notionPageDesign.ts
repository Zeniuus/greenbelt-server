import { CreatePageParameters } from "@notionhq/client/build/src/api-endpoints";

export default function getNotionPageConfig(notionPageId: string, name: string, email: string, blahBlah: string, profileImageUrl: string | null): CreatePageParameters {
  return {
    parent: {
      database_id: notionPageId,
    },
    properties: {
      Name: {
        title: [
          {
            text: {
              content: name,
            },
          },
        ],
      },
      Email: {
        rich_text: [
          {
            text: {
              content: email,
            },
          },
        ],
      },
    },
    children: [
      {
        object: 'block',
        paragraph: {
          text: [
            {
              type: 'text',
              text: {
                content: blahBlah,
              },
            },
          ],
        },
      },
      ...(
        profileImageUrl ? [{
          image: {
            external: {
              url: profileImageUrl,
            },
          },
        }] : []
      ),
    ],
  };
}
