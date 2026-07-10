/* eslint import/prefer-default-export: off */
import { URL } from 'url';
import path from 'path';
import { gameMap, roomValues } from '../static/mapData';

export function resolveHtmlPath(htmlFileName: string) {
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 1212;
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  }
  return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
}

type NEWS = "n" | "e" | "w" | "s"

export const oppositeOf = (input: NEWS) => {
  if (input == "n") return "s"
  if (input == "e") return "w"
  if (input == "w") return "e"
  if (input == "s") return "n"
  return input
}

export const leftOf = (input: NEWS) => {
  if (input === "n") return "w"
  if (input === "e") return "n"
  if (input === "w") return "s"
  if (input === "s") return "e"
  return input
}

export const rightOf = (input: "n" | "s" | "e" | "w") => oppositeOf(leftOf(input))

const findRoomIndex = (targetPath: string) => {
  for (let r = 0; r < gameMap.length; r++) {
    for (let c = 0; c < gameMap[r].length; c++) {
      if (gameMap[r][c].path === targetPath) {
        return [r, c]; // Return [rowIndex, colIndex]
      }
    }
  }
  return [-1, -1]; // Return if ID does not exist
}

export const oneSpaceForward = (currentLocation: string, currentDirection: NEWS) => {
  const currentIndex = findRoomIndex(currentLocation)

  if (currentDirection == "n") currentIndex[0] -= 1
  if (currentDirection == "s") currentIndex[0] += 1
  if (currentDirection == "e") currentIndex[1] += 1
  if (currentDirection == "w") currentIndex[1] -= 1

  return gameMap[currentIndex[0]][currentIndex[1]].path
}

export const oneSpaceBackward = (currentLocation: string, currentDirection: NEWS) => {
  const currentIndex = findRoomIndex(currentLocation)

  if (currentDirection == "n") currentIndex[0] += 1
  if (currentDirection == "s") currentIndex[0] -= 1
  if (currentDirection == "e") currentIndex[1] -= 1
  if (currentDirection == "w") currentIndex[1] += 1

  return gameMap[currentIndex[0]][currentIndex[1]].path
}
