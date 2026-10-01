import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import HostDash from './pages/HostDash'
import HostNew from './pages/HostNew'
import Join from './pages/Join'
import Present from './pages/Present'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/join/:code" element={<Join />} />
        <Route path="/host" element={<HostNew />} />
        <Route path="/host/:code" element={<HostDash />} />
        <Route path="/present/:code" element={<Present />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  )
}
