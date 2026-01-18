import "./styles/global.css";
import "./styles/theme.css";

import { Routes, Route } from "react-router-dom";

import { Index } from "./pages/Index";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Index />}></Route>
      </Routes>
    </>
  )
}

export default App
