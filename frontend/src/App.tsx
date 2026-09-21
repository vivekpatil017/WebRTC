import { BrowserRouter, Route, Routes } from "react-router-dom"
import { Room } from "./components/Room"
import Hero from "./components/ui/hero"

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/room" element={<Room />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App