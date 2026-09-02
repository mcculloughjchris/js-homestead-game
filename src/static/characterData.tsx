export interface Response {
  text: string
  goto?: string
  /** Same method('arg') callback mechanism as Conversation.afterContinue, but fires as soon as
   *  this response is picked, alongside navigating to `goto` - see runAfterContinue in main.ts. */
  afterContinue?: string
}

export interface Conversation {
  id: string
  text: string
  starter: boolean
  path?: string
  responses?: Response[]
  afterContinue?: string
  repeatable?: boolean
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
  /** Number of days that must have passed before this character can be selected for a
   *  door-knock (0-indexed, matching game.days.length - 1 elsewhere in the codebase - e.g. 1
   *  means "not until day 2"). Omit (or 0) for no restriction - available from day one. */
  unlockAfterDays?: number
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
        afterContinue: "pickSleepingSpace('Backpacker')"
      },
      {
        id: "backpacker_introduction_no",
        text: "Thank you anyways.",
        starter: false,
        afterContinue: "leaveDoor('backpacker')"
      },
      {
        id: "backpacker_request_2",
        text: "Hey, man I really need a place to crash. Can you help me out?",
        starter: true,
        responses: [
          {
            text: "Ok, yeah come on in.",
            goto: "backpacker_introduction_thanks"
          },
          {
            text: "No, leave me alone please.",
            goto: "backpacker_request_2_no"
          }
        ]
      },
      {
        id: "backpacker_request_2_no",
        text: "Damn. Thanks anyways.",
        starter: false,
        afterContinue: "leaveDoor('Backpacker')"
      },
      {
        id: "backpacker_request_3",
        text: "I need help, seriously, can you let me stay here for a bit?",
        starter: true,
        responses: [
          {
            text: "Fine",
            goto: "backpacker_introduction_thanks"
          },
          {
            text: "NO",
            goto: "backpacker_request_3_no_1"
          }
        ]
      },
      {
        id: "backpacker_request_3_no_1",
        text: "Go to hell.",
        starter: false,
        responses: [
          {
            text: "Will do.",
            afterContinue: "leaveDoor('Backpacker')"
          }
        ]
      },
      {
        id: "backpacker_inside_1_1",
        text: "Thanks again for the help! I’ll try to let you know if there’s any pigs around.",
        starter: true,
        responses: [
          {
            text: "Cool!",
          }
        ]
      },
      {
        id: "backpacker_inside_2_1",
        text: "You have no idea how seriously you saved my ass, thanks again.",
        starter: true,
        responses: [
          {
            text: "How so?",
            goto: "backpacker_inside_2_2"
          }
        ]
      },
      {
        id: "backpacker_inside_2_2",
        text: "I’m on my way to Canada, what’s left of it anyways, and I got stopped on the way. I ran, but those pigs are slow as hell.",
        starter: false,
        responses: [
          {
            text: "I didn’t know you’re running from the law, get out.",
          },
          {
            text: "Cool, you can stick around."
          }
        ]
      },
      {
        id: "backpacker_couch_1_1",
        text: "I didn’t sit down for so long while on the run, this couch rocks!",
        starter: true,
        path: "lroom4/n",
        responses: [
          {
            text: "I’m just glad to help",
          },
          {
            text: "There's rocks in the couch?",
            goto: "backpacker_couch_1_2"
          }
        ]
      },
      {
        id: "backpacker_couch_1_2",
        text: "What?",
        starter: false,
        path: "lroom4/n",
      },
      {
        id: "backpacker_desk_1_1",
        text: "I’m not much of a writer but boy am I glad to be sitting down",
        starter: true,
        responses: [
          {
            text: "I'm just glad to help"
          }
        ]
      }
    ]
  },
  'Nurse': {
    name: 'Nurse',
    class: 'traveler',
    conversations: [
      {
        id: "nurse_introduction_1",
        text: "Hello, I’m Nancy. I was working at the hospital but it shut down last month and I ended up being late on my rent. Now I’m looking for a place to stay.",
        starter: true,
        responses: [
          {
            text: "You can stay here, come on in.",
            afterContinue: "pickSleepingSpace('Nurse')"
          },
          {
            text: "I can’t let you in, sorry.",
            afterContinue: "leaveDoor('Nurse')"
          }
        ]
      },
      {
        id: "nurse_inside_1",
        text: "I’m so glad to not be on the streets. If anyone in the house gets sick or hurt I can help out.",
        starter: false,
        responses: [
          {
            text: "Thanks!"
          }
        ]
      }
    ]
  },
  'Musician': {
    name: 'Musician',
    class: 'traveler',
    conversations: [
    ]
  },
  'Collector': {
    name: 'Collector',
    class: 'traveler',
    conversations: [
      {
        id: "collector_introduction_1_1",
        text: "Hello! I’m looking for a place to hide.",
        starter: true,
        responses: [
          {
            text: "Why?",
            goto: "collector_introduction_1_2"
          },
          {
            text: "Beat it",
            afterContinue: "leaveDoor('Collector')"
          }
        ]
      },
      {
        id: "collector_introduction_1_2",
        text: "I collect artwork and have pieces the authorities are looking for.",
        starter: false,
        responses: [
          {
            text: "Wealth hoarding? See ya",
            goto: "collector_introduction_1_3"
          }
        ]
      },
      {
        id: "collector_introduction_1_3",
        text: "I have pieces that could be used to bribe officers!",
        starter: false,
        responses: [
          {
            text: "Fine, come in.",
            afterContinue: "pickSleepingSpace('Collector')"
          },
          {
            text: "Nope, bye!",
            afterContinue: "leaveDoor('Collector')"
          }
        ]
      },
      {
        id: "collector_inside_1",
        text: "Thank you for taking me in.",
        starter: true
      }
    ]
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
            text: "Let's trade.",
            afterContinue: "trade"
          },
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
      },
      {
        id: "beekeeper_trade_offer_1",
        text: "Hi! I just wanted to pop by and see if you wanted to trade!",
        starter: true,
        responses: [
          {
            text: "Yes!",
            afterContinue: "start_trade()"
          },
          {
            text: "No thanks.",
            goto: "beekeeper_trade_offer_no"
          }
        ]
      },
      {
        id: "beekeeper_trade_offer_no",
        text: "Ah, maybe next time!",
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
    unlockAfterDays: 1, // no inspection on day one
    conversations: [
      {
        id: 'officer_introduction',
        text: "This is a routine inspection. I need to come in and take a look around.",
        starter: true,
        repeatable: true,
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
