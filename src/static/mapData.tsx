import FrontDoorNorth from "../renderer/components/rooms/FrontDoor/FrontDoorNorth"
import LRoom0East from "../renderer/components/rooms/LRoom0/LRoom0East"
import LRoom0North from "../renderer/components/rooms/LRoom0/LRoom0North"
import LRoom0South from "../renderer/components/rooms/LRoom0/LRoom0South"
import LRoom0West from "../renderer/components/rooms/LRoom0/LRoom0West"
import LRoom1East from "../renderer/components/rooms/LRoom1/LRoom1East"
import LRoom1North from "../renderer/components/rooms/LRoom1/LRoom1North"
import LRoom1South from "../renderer/components/rooms/LRoom1/LRoom1South"
import LRoom1West from "../renderer/components/rooms/LRoom1/LRoom1West"
import LRoom2East from "../renderer/components/rooms/LRoom2/LRoom2East"
import LRoom2North from "../renderer/components/rooms/LRoom2/LRoom2North"
import LRoom2South from "../renderer/components/rooms/LRoom2/LRoom2South"
import LRoom2West from "../renderer/components/rooms/LRoom2/LRoom2West"
import LRoom3East from "../renderer/components/rooms/LRoom3/LRoom3East"
import LRoom3North from "../renderer/components/rooms/LRoom3/LRoom3North"
import LRoom3South from "../renderer/components/rooms/LRoom3/LRoom3South"
import LRoom3West from "../renderer/components/rooms/LRoom3/LRoom3West"
import LRoom4East from "../renderer/components/rooms/LRoom4/LRoom4East"
import LRoom4North from "../renderer/components/rooms/LRoom4/LRoom4North"
import LRoom4South from "../renderer/components/rooms/LRoom4/LRoom4South"
import LRoom4West from "../renderer/components/rooms/LRoom4/LRoom4West"
import LRoom5East from "../renderer/components/rooms/LRoom5/LRoom5East"
import LRoom5North from "../renderer/components/rooms/LRoom5/LRoom5North"
import LRoom5South from "../renderer/components/rooms/LRoom5/LRoom5South"
import LRoom5West from "../renderer/components/rooms/LRoom5/LRoom5West"

export type Direction = "n" | "s" | "e" | "w"

export interface RoomValue {
  path: string
  images: {
    n: string | React.ElementType
    s: string | React.ElementType
    e: string | React.ElementType
    w: string | React.ElementType
  },
  boundary?: Direction[]
}

export interface RoomValues {
  [k: string]: RoomValue
}

export const roomValues: RoomValues = {
  lroom0: {
    path: "lroom0",
    images: {
      n: LRoom0North,
      s: LRoom0South,
      e: LRoom0East,
      w: LRoom0West
    },
    boundary: ["n", "w"]
  },
  lroom1: {
    path: "lroom1",
    images: {
      n: LRoom1North,
      s: LRoom1South,
      e: LRoom1East,
      w: LRoom1West
    },
    boundary: ["n"]
  },
  lroom2: {
    path: "lroom2",
    images: {
      n: LRoom2North,
      s: LRoom2South,
      e: LRoom2East,
      w: LRoom2West
    },
    boundary: ["w"]
  },
  lroom3: {
    path: "lroom3",
    images: {
      n: LRoom3North,
      s: LRoom3South,
      e: LRoom3East,
      w: LRoom3West
    },
  },
  lroom4: {
    path: "lroom4",
    images: {
      n: LRoom4North,
      s: LRoom4South,
      e: LRoom4East,
      w: LRoom4West
    },
    boundary: ["s", "w"]
  },
  lroom5: {
    path: "lroom5",
    images: {
      n: LRoom5North,
      s: LRoom5South,
      e: LRoom5East,
      w: LRoom5West
    },
    boundary: ["s", "e"]
  },
  frontDoor: {
    path: "front-door",
    images: {
      n: FrontDoorNorth,
      s: "",
      e: "",
      w: ""
    },
    boundary: []
  },
  bedroom: {
    path: "bedroom",
    images: {
      n: "",
      s: "",
      e: "",
      w: ""
    },
    boundary: ["n", "s"]
  },
  bathroom: {
    path: "bathroom",
    images: {
      n: "",
      s: "",
      e: "",
      w: ""
    },
    boundary: ["n", "s", "e"]
  },
  kitchen0: {
    path: "kitchen0",
    images: {
      n: "",
      s: "",
      e: "",
      w: ""
    },
    boundary: []
  },
  kitchen1: {
    path: "kitchen1",
    images: {
      n: "",
      s: "",
      e: "",
      w: ""
    },
    boundary: ["n"]
  },
  kitchen2: {
    path: "kitchen2",
    images: {
      n: "",
      s: "",
      e: "",
      w: ""
    },
    boundary: ["n", "e"]
  },
  kitchen3: {
    path: "kitchen3",
    images: {
      n: "",
      s: "",
      e: "",
      w: ""
    },
    boundary: ["w"]
  },
  kitchen4: {
    path: "kitchen4",
    images: {
      n: "",
      s: "",
      e: "",
      w: ""
    },
    boundary: ["s"]
  },
  kitchen5: {
    path: "kitchen5",
    images: {
      n: "",
      s: "",
      e: "",
      w: ""
    },
    boundary: ["e", "s"]
  },
  porch0: {
    path: "porch0",
    images: {
      n: "",
      s: "",
      e: "",
      w: ""
    },
    boundary: ["n", "s", "w"]
  },
  porch1: {
    path: "porch1",
    images: {
      n: "",
      s: "",
      e: "",
      w: ""
    },
    boundary: ["n", "s"]
  },
  porch2: {
    path: "porch2",
    images: {
      n: "",
      s: "",
      e: "",
      w: ""
    },
    boundary: ["s"]
  },
  porch3: {
    path: "porch3",
    images: {
      n: "",
      s: "",
      e: "",
      w: ""
    },
    boundary: ["n", "s"]
  },
  porch4: {
    path: "porch4",
    images: {
      n: "",
      s: "",
      e: "",
      w: ""
    },
    boundary: ["n", "s", "e"]
  }
}

export const campableRooms = [
  {
    name: "Couch",
    path: "lroom4",
    direction: "n"
  },
  {
    name: "Desk",
    path: "lroom5",
    direction: "s"
  }
]

export const gameMap = [
  [roomValues.lroom0, roomValues.lroom1, roomValues.frontDoor, roomValues.bedroom, roomValues.bathroom],
  [roomValues.lroom2, roomValues.lroom3, roomValues.kitchen0, roomValues.kitchen1, roomValues.kitchen2],
  [roomValues.lroom4, roomValues.lroom5, roomValues.kitchen3, roomValues.kitchen4, roomValues.kitchen5],
  [roomValues.porch0, roomValues.porch1, roomValues.porch2, roomValues.porch3, roomValues.porch4]
]
