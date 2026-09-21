import { BrowserRouter, Route, Routes } from "react-router-dom"
import { Room } from "./components/Room"
import Home from "./components/Home"

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/room" element={<Room />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App