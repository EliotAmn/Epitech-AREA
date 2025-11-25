import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import WidgetDetail from './pages/WidgetDetail'
import SignUp from './pages/SignUp'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/widget/:id" element={<WidgetDetail />} />
        <Route path="/signup" element={<SignUp/>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
