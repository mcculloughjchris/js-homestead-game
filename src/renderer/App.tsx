import { MemoryRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import Introduction from './components/Introduction';
import TitleScreen from './components/TitleScreen';
import NewGameScreen from './components/NewGameScreen';
import Room from './components/Room';
import { GameProvider } from './hooks/useGame';
import { roomValues } from '../static/mapData';
import LoadGameScreen from './components/LoadGameScreen';

import "./App.css"
import SetCharacterPosition from './components/SetCharacterPosition';

const paths = {
  intro: {
    path: "/",
    element: <Introduction />
  },
  title: {
    path: "/title-screen",
    element: <TitleScreen />
  },
  newGame: {
    path: "/new-game",
    element: <NewGameScreen />
  },
  loadGame: {
    path: "/load-game",
    element: <LoadGameScreen />
  }
}

export default function App() {
  return (
    <Router>
      <Routes>
        {Object.values(paths).map((p) => {
          return (
            <Route path={p.path} element={p.element} key={`route-${p.path}`} />
          )
        })}

        <Route path="/:id" element={<GameProvider />}>
          {Object.values(roomValues).map(room => {
            const roomProps = (facing: "n" | "s" | "e" | "w") => ({
              facing: facing,
              image: room.images[facing]
            })

            return (
              <Route path={room.path} key={`room-${room.path}`}>
                <Route path="n" element={<Room {...roomProps("n")} />} />
                <Route path="s" element={<Room {...roomProps("s")} />} />
                <Route path="e" element={<Room {...roomProps("e")} />} />
                <Route path="w" element={<Room {...roomProps("w")} />} />
              </Route>
            )
          })}
          <Route path="set-character-position/:character" element={<SetCharacterPosition />} />
        </Route>
      </Routes>
    </Router>
  );
}
