import React from 'react'
import {BrowserRouter, Route, Routes} from "react-router-dom"
import {Receiver} from "./components/Receiver"
import {Sender} from "./components/Sender"


const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/receiver" element={<Receiver/>}/>
        <Route path="/sender" element={<Sender/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App