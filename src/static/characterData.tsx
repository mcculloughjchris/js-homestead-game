interface Response {
  text: string
  goto?: string
}

export interface Conversation {
  id: string
  text: string
  starter: boolean
  responses?: Response[]
}

export interface Character {
  name: string
  conversations?: Conversation[]
}

interface Characters {
  [k: string]: Character
}

const characters: Characters = {
  'Joline': {
    name: 'Joline',
    conversations: [
      {
        id: "joline_introduction",
        text: "Hi, can I crash on your couch for a couple nights?",
        starter: true,
        responses: [
          {
            text: "Sure, come on in",
            goto: "joline_introduction_yes"
          },
          {
            text: "Sorry, I can't help you out right now.",
            goto: "joline_introduction_no"
          }
        ]
      },
      {
        id: "joline_introduction_thanks",
        text: "Thanks! You're a life saver!",
        starter: false,
      },
      {
        id: "joline_introduction_no",
        text: "Thank you anyways.",
        starter: false,
      }
    ]
  }
}

export default characters
