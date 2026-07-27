export interface Response {
  text: string
  goto?: string
}

export interface Conversation {
  id: string
  text: string
  starter: boolean
  responses?: Response[]
  afterContinue?: string
}

export interface Character {
  name: string
  class: "traveler" | "neighbor" | "government" | "needy" | "media"
  conversations?: Conversation[]
}

interface Characters {
  [k: string]: Character
}

const characters: Characters = {
  'Joline': {
    name: 'Joline',
    class: "traveler",
    conversations: [
      {
        id: "joline_introduction",
        text: "Hi, can I crash on your couch for a couple nights?",
        starter: true,
        responses: [
          {
            text: "Sure, come on in",
            goto: "joline_introduction_thanks"
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
        afterContinue: "pickSleepingSpace('Joline')"
      },
      {
        id: "joline_introduction_no",
        text: "Thank you anyways.",
        starter: false,
        afterContinue: "leaveDoor('Joline')"
      }
    ]
  },
  'Beekeeper': {
    name: 'Beekeeper',
    class: "neighbor",
    conversations: [
      {
        id: 'beekeeper_introduction',
        text: "Hello there! I live a few doors down and wanted to introduce myself!",
        starter: true,
        responses: [
          {
            text: "Ok, your name is?",
            goto: "beekeeper_introduction_2"
          }
        ]
      },
      {
        id: 'beekeeper_introduction_2',
        text: "I'm a beekeeper, and I'm always ready to trade honey and beeswax!",
        starter: false,
        responses: [
          {
            text: "Cool, but you didn't give me your name?",
            goto: "beekeeper_introduction_3"
          }
        ]
      },
      {
        id: 'bekeeper_introduction_3',
        text: "Haha! I'll catch you around ok?",
        starter: false,
        afterContinue: "leaveDoor('Beekeeper')"
      }
    ]
  }
}

export default characters
