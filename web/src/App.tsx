import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import WidgetDetail from './pages/WidgetDetail'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/widget/:id" element={<WidgetDetail />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
