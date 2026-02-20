import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Produse from './pages/Produse'
import Siguranta from './pages/Siguranta'
import Divizii from './pages/Divizii'
import LithTech from './pages/LithTech'
import Instalatori from './pages/Instalatori'
import Companie from './pages/Companie'
import Viziune from './pages/Viziune'
import Login from './pages/Login'
import Typography from './pages/Typography'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="produse" element={<Produse />} />
          <Route path="siguranta" element={<Siguranta />} />
          <Route path="divizii" element={<Divizii />} />
          <Route path="divizii/:slug" element={<Divizii />} />
          <Route path="lithtech" element={<LithTech />} />
          <Route path="instalatori" element={<Instalatori />} />
          <Route path="companie" element={<Companie />} />
          <Route path="companie/viziune" element={<Viziune />} />
          <Route path="companie/:slug" element={<Companie />} />
          <Route path="login" element={<Login />} />
          <Route path="typography" element={<Typography />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
