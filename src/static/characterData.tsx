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
  'Backpacker': {
    name: 'Backpacker',
    class: "traveler",
    conversations: [
      {
        id: "backpacker_introduction",
        text: "Hi, can I crash on your couch for a couple nights?",
        starter: true,
        responses: [
          {
            text: "Sure, come on in",
            goto: "backpacker_introduction_thanks"
          },
          {
            text: "Sorry, I can't help you out right now.",
            goto: "backpacker_introduction_no"
          }
        ]
      },
      {
        id: "backpacker_introduction_thanks",
        text: "Thanks! You're a life saver!",
        starter: false,
        afterContinue: "pickSleepingSpace('backpacker')"
      },
      {
        id: "backpacker_introduction_no",
        text: "Thank you anyways.",
        starter: false,
        afterContinue: "leaveDoor('backpacker')"
      }
    ]
  },
  'Nurse': {
    name: 'Nurse',
    class: 'traveler',
    conversations: []
  },
  'Musician': {
    name: 'Musician',
    class: 'traveler',
    conversations: []
  },
  'Collector': {
    name: 'Collector',
    class: 'traveler',
    conversations: []
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
  },
  'Widow': {
    name: 'Widow',
    class: "neighbor",
    conversations: []
  },
  'Veteran': {
    name: 'Veteran',
    class: 'neighbor',
    conversations: []
  },
  'Teacher': {
    name: 'Teacher',
    class: 'neighbor',
    conversations: []
  },
  'Mechanic': {
    name: 'Mechanic',
    class: 'neighbor',
    conversations: []
  },
  'Census': {
    name: 'Census',
    class: 'government',
    conversations: []
  },
  'Officer': {
    name: 'Officer',
    class: 'government',
    conversations: []
  },
  'Utility': {
    name: 'Utility',
    class: 'government',
    conversations: []
  },
  'Hungry': {
    name: 'Hungry',
    class: 'needy',
    conversations: []
  },
  'Injured': {
    name: 'Injured',
    class: 'needy',
    conversations: []
  },
  'Child': {
    name: 'Child',
    class: 'needy',
    conversations: []
  },
  'Pregnant': {
    name: 'Pregnant',
    class: 'needy',
    conversations: []
  },
  'Elderly': {
    name: 'Elderly',
    class: 'needy',
    conversations: []
  },
  'Journalist': {
    name: 'Journalist',
    class: 'media',
    conversations: []
  },
  'Youtuber': {
    name: 'Youtuber',
    class: 'media',
    conversations: []
  },
  'Reporter': {
    name: 'Reporter',
    class: 'media',
    conversations: []
  }
}

export default characters
