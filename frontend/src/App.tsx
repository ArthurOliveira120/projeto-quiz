import "./styles/global.css";
import "./styles/theme.css";

import { Routes, Route } from "react-router-dom";

import { Index } from "./pages/Index";
import { Games } from "./pages/Games";
import { Host } from "./pages/Host";
import { Play } from "./pages/Play";
import { NewGame } from "./pages/NewGame";
import { EditGame } from "./pages/EditGame";
import { Header } from "./components/Header";

function App() {
  return (
    <>
    <Header />
      <Routes>
        <Route path="/" element={<Index />}></Route>

        <Route path="/games" element={<Games />} />
        <Route path="/games/new" element={<NewGame />} />
        <Route path="/games/:id/edit" element={<EditGame />} />

        <Route path="/host/:pin" element={<Host />} />
        <Route path="/play/:pin" element={<Play />} />
      </Routes>
    </>
  )
}

export default App
