interface Response {
  dialogue: string
  gotoConvo: Conversation
}

interface Conversation {
  dialogue: string
  responses: Response[]
}

interface RandomEventOption {
  id: string
  conversation: Conversation
}

interface RandomEvent {
  id: string
  eventOptions: RandomEventOption[]
}

const randomEvents: RandomEvent[] = [
  {
    id: "hungryTraveler",
    eventOptions: [
      {
        id: "begging1",
        conversation: {
          dialogue: "Got any food?",
          responses: []
        }
      }
    ]
  },
]
