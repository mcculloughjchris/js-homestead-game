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
  /** Items this character has available to trade from the start of the game. */
  startingInventory?: Record<string, number>
  /** Hours (24hr military time, e.g. 900 = 9:00AM, 1730 = 5:30PM) this character is willing to
   *  door-knock during. Omit for no restriction (any time the day is open, per DAY_START_HOUR/
   *  DAY_END_HOUR in gameTime.ts). Compared inclusively against the same currentTime value
   *  onDayActionAdded listeners already receive - see triggerDoorKnock in main.ts. */
  activeHours?: { start: number; end: number }
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
    startingInventory: {
      honey: 3,
      beeswax: 2
    },
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
        id: 'beekeeper_introduction_3',
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
    activeHours: { start: 900, end: 1700 }, // business hours only
    conversations: [
      {
        id: 'officer_introduction',
        text: "This is a routine inspection. I need to come in and take a look around.",
        starter: true,
        responses: [
          {
            text: "Sure, go ahead.",
            goto: 'officer_introduction_allow'
          }
        ]
      },
      {
        id: 'officer_introduction_allow',
        text: "This won't take long.",
        starter: false,
        afterContinue: "startInspection('Officer')"
      },
      // Nothing found - a quick, friendly send-off.
      {
        id: 'officer_all_clear',
        text: "Everything looks good here. Have a nice day.",
        starter: false,
        afterContinue: "leaveDoor('Officer')"
      },
      // Something illegal was found - branches into give up/bribe/fight.
      // Each branch is currently just a placeholder response; the actual
      // consequences (arrest sequence, bribery cost, combat) aren't
      // implemented yet - see InspectionManager's extension point notes.
      {
        id: 'officer_caught',
        text: "Sir, you're going to have to come with me.",
        starter: false,
        responses: [
          {
            text: "Give up",
            goto: 'officer_caught_give_up'
          },
          {
            text: "Offer a bribe",
            goto: 'officer_caught_bribe'
          },
          {
            text: "Fight",
            goto: 'officer_caught_fight'
          }
        ]
      },
      {
        id: 'officer_caught_give_up',
        text: "Smart choice. Let's go.",
        starter: false,
        afterContinue: "leaveDoor('Officer')" // TODO
      },
      {
        id: 'officer_caught_bribe',
        text: "...I suppose we could work something out.",
        starter: false,
        afterContinue: "leaveDoor('Officer')" // TODO
      },
      {
        id: 'officer_caught_fight',
        text: "You really don't want to do that.",
        starter: false,
        afterContinue: "fight('Officer')"
      }
    ]
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
