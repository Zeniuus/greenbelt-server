import { CreatePageParameters } from "@notionhq/client/build/src/api-endpoints";

interface NotionPageData {
  notionPageId: string;
  date: Date;
  name: string;
  phoneNumber: string;
  email: string;
  facebookLink: string;
  instagramLink: string;
  blogLink: string;
  nameAndElection: string;
  profileImageUrl?: string;
  shortSummary: string;
  longSummary: string;
  experience: string;
  experienceImageUrl?: string;
  electionReason: string;
  electionReasonImageUrl?: string;
  mbti: string;
  favoriteMovieAndDrama: string;
  howToSpendWeekends: string;
  howToReduceStress: string;
  favoriteFood: string;
  respectingPeople: string;
  favoriteBooks: string;
  planAfterElected: string;
  openChatUrl?: string;
}

export default function getNotionPageConfig(data: NotionPageData): CreatePageParameters {
  return {
    parent: {
      database_id: data.notionPageId,
    },
    properties: {
      Name: {
        title: [
          {
            text: {
              content: data.nameAndElection,
            },
          },
        ],
      },
      이메일: propertyContent(data.email),
      요약: propertyContent(data.shortSummary),
      '페이스북 주소': propertyContent(data.facebookLink, data.facebookLink),
      '인스타그램 주소': propertyContent(data.instagramLink, data.instagramLink),
      '개인 페이지 주소': propertyContent(data.blogLink, data.blogLink),
    },
    children: [
      ...data.profileImageUrl ? [image(data.profileImageUrl)] : [],
      heading(`요약: "${data.longSummary}"`),
      emptyLine(),

      heading('— 어떤 경험을 해왔나요?'),
      ...data.experienceImageUrl ? [image(data.experienceImageUrl)] : [],
      ...plainTexts(data.experience),
      emptyLine(),

      heading('— 출마를 결심하게 된 계기는요?'),
      ...data.electionReasonImageUrl ? [image(data.electionReasonImageUrl)] : [],
      ...plainTexts(data.electionReason),
      emptyLine(),

      heading('— 라이프 스타일'),
      emptyLine(),
      toggle('MBTI', data.mbti),
      toggle('좋아하는 영화 또는 드라마', data.favoriteMovieAndDrama),
      toggle('주말에 시간을 보내는 방법', data.howToSpendWeekends),
      toggle('스트레스를 해소하는 방법', data.howToReduceStress),
      toggle('좋아하는 음식', data.favoriteFood),
      toggle('많은 영감, 영향을 받은 유명인물', data.respectingPeople),
      toggle('감명 깊게 읽은 책', data.favoriteBooks),
      emptyLine(),

      heading('— 당선되면 가장 하고 싶은 일은 무엇인가요?'),
      emptyLine(),
      ...plainTexts(data.planAfterElected),
      emptyLine(),

      // TODO: callout도 함수화하기
      ...(data.openChatUrl ? [{
        object: 'block',
        callout: {
          text: [
            {
              type: 'text',
              text: {
                content: `${data.name}님을 더 알고 싶다면 ${data.name}님이 운영하는 오픈채팅방에 들어오세요. 오픈채팅방 참여자에게는 한정판 NFT를 드립니다. (`,
              },
            },
            {
              type: 'text',
              text: {
                content: '오픈채팅방 들어오기',
                link: {
                  url: data.openChatUrl.startsWith('http') ? data.openChatUrl : `https://${data.openChatUrl}`,
                },
              },
            },
            {
              type: 'text',
              text: {
                content: ')',
              },
            },
          ],
          icon: {
            emoji: '🤟',
          },
        },
      }] : []),
    ],
  };
}

function propertyContent(text: string, link: string | null = null): any {
  return {
    rich_text: [
      {
        text: {
          content: text,
          link: link ? {
            url: link,
          } : null,
        },
      },
    ],
  };
}

function image(imageUrl: string): any {
  return {
    image: {
      external: {
        url: imageUrl,
      },
    },
  };
}

function heading(text: string): any {
  return {
    object: 'block',
    heading_2: {
      text: [
        {
          type: 'text',
          text: {
            content: text,
          },
        },
      ],
    },
  };
}

function plainTexts(text: string): any[] {
  return text.split('\n').map((line) => {
    return {
      object: 'block',
      paragraph: {
        text: [
          {
            type: 'text',
            text: {
              content: line,
            },
          },
        ],
      },
    };
  });
}

function emptyLine(): any {
  return {
    object: 'block',
    paragraph: {
      text: [],
    },
  };
}

function toggle(title: string, content: string, titleBold: boolean = true): any {
  return {
    object: 'block',
    toggle: {
      text: [
        {
          type: 'text',
          text: {
            content: title,
          },
          annotations: {
            bold: titleBold,
          },
        },
      ],
      children: plainTexts(content),
    },
  };
}
