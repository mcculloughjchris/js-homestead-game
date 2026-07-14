import LRoom0North from "../renderer/components/rooms/LRoom0North"

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
      s: "",
      e: "",
      w: ""
    },
    boundary: ["n", "w"]
  },
  lroom1: {
    path: "lroom1",
    images: {
      n: "",
      s: "",
      e: "",
      w: ""
    },
    boundary: ["n"]
  },
  lroom2: {
    path: "lroom2",
    images: {
      n: "",
      s: "",
      e: "",
      w: ""
    },
    boundary: ["w"]
  },
  lroom3: {
    path: "lroom3",
    images: {
      n: "",
      s: "",
      e: "",
      w: ""
    },
  },
  lroom4: {
    path: "lroom4",
    images: {
      n: "",
      s: "",
      e: "",
      w: ""
    },
    boundary: ["s", "w"]
  },
  lroom5: {
    path: "lroom5",
    images: {
      n: "",
      s: "",
      e: "",
      w: ""
    },
    boundary: ["s", "e"]
  },
  frontDoor: {
    path: "front-door",
    images: {
      n: "",
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

export const gameMap = [
  [roomValues.lroom0, roomValues.lroom1, roomValues.frontDoor, roomValues.bedroom, roomValues.bathroom],
  [roomValues.lroom2, roomValues.lroom3, roomValues.kitchen0, roomValues.kitchen1, roomValues.kitchen2],
  [roomValues.lroom4, roomValues.lroom5, roomValues.kitchen3, roomValues.kitchen4, roomValues.kitchen5],
  [roomValues.porch0, roomValues.porch1, roomValues.porch2, roomValues.porch3, roomValues.porch4]
]
