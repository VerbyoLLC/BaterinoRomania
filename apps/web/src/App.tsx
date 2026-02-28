import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import Layout from './components/Layout'
import AuthWrapper from './components/AuthWrapper'
import Home from './pages/Home'
import Produse from './pages/Produse'
import Siguranta from './pages/Siguranta'
import Divizii from './pages/Divizii'
import Rezidential from './pages/Rezidential'
import Industrial from './pages/Industrial'
import Medical from './pages/Medical'
import Maritim from './pages/Maritim'
import Reduceri from './pages/Reduceri'
import LithTech from './pages/LithTech'
import Instalatori from './pages/Instalatori'
import Companie from './pages/Companie'
import Viziune from './pages/Viziune'
import Typography from './pages/Typography'
import Login from './pages/Login'
import SignupClienti from './pages/SignupClienti'
import ResetPassword from './pages/ResetPassword'
import SignupParteneriProfil from './pages/SignupParteneriProfil'
import SignupParteneriProfilPublic from './pages/SignupParteneriProfilPublic'
import ProductRezidential from './pages/ProductRezidential'
import AdminLogin from './pages/admin/AdminLogin'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminCompanies from './pages/admin/AdminCompanies'
import AdminProducts from './pages/admin/AdminProducts'
import AdminDiscounts from './pages/admin/AdminDiscounts'
import Blog from './pages/Blog'
import TermeniSiConditii from './pages/TermeniSiConditii'
import TermeniSiConditiiProgrameReducere from './pages/TermeniSiConditiiProgrameReducere'
import PoliticaConfidentialitate from './pages/PoliticaConfidentialitate'
import Cariere from './pages/Cariere'
import SliderExamples from './pages/SliderExamples'
import PartnerLayout from './pages/partner/PartnerLayout'
import PartnerDashboard from './pages/partner/PartnerDashboard'
import PartnerPublicProfile from './pages/partner/PartnerPublicProfile'
import PartnerSettings from './pages/partner/PartnerSettings'
import PartnerProducts from './pages/partner/PartnerProducts'
import PartnerOrders from './pages/partner/PartnerOrders'
import PartnerService from './pages/partner/PartnerService'
import PartnerSupport from './pages/partner/PartnerSupport'

export default function App() {
  return (
    <HelmetProvider>
    <BrowserRouter>
      <Routes>
        {/* ── Admin (no header / footer) ── */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products"  element={<AdminProducts />} />
          <Route path="clients"   element={<AdminDashboard />} />
          <Route path="companies" element={<AdminCompanies />} />
          <Route path="articles"  element={<AdminDashboard />} />
          <Route path="stocks"    element={<AdminDashboard />} />
          <Route path="orders"    element={<AdminDashboard />} />
          <Route path="discounts" element={<AdminDiscounts />} />
        </Route>

        {/* ── Auth pages (no header / footer) ── */}
        <Route path="/login" element={<AuthWrapper><Login /></AuthWrapper>} />
        <Route path="/signup/clienti" element={<AuthWrapper><SignupClienti /></AuthWrapper>} />
        <Route path="/signup/parteneri" element={<Navigate to="/signup/clienti?tab=partener" replace />} />
        <Route path="/signup/parteneri/profil" element={<AuthWrapper><SignupParteneriProfil /></AuthWrapper>} />
        <Route path="/signup/parteneri/profil-public" element={<AuthWrapper><SignupParteneriProfilPublic /></AuthWrapper>} />
        <Route path="/reset-password" element={<AuthWrapper><ResetPassword /></AuthWrapper>} />

        {/* ── Partner area (no header / footer) ── */}
        <Route path="/partner" element={<PartnerLayout />}>
          <Route index element={<PartnerDashboard />} />
          <Route path="dashboard" element={<PartnerDashboard />} />
          <Route path="profil" element={<PartnerPublicProfile />} />
          <Route path="setari" element={<PartnerSettings />} />
          <Route path="produse" element={<PartnerProducts />} />
          <Route path="comenzi" element={<PartnerOrders />} />
          <Route path="servicii" element={<PartnerService />} />
          <Route path="suport" element={<PartnerSupport />} />
        </Route>

        {/* ── QR code links (no pages, redirect only) ── */}
        <Route path="/qr/main" element={<Navigate to="/" replace />} />
        <Route path="/qr/instalatori-event-bucharest2026" element={<Navigate to="/instalatori" replace />} />
        <Route path="/qr/rbc" element={<Navigate to="/companie" replace />} />
        <Route path="/qr/abc" element={<Navigate to="/companie" replace />} />
        <Route path="/qr/idbc" element={<Navigate to="/instalatori" replace />} />

        {/* ── Main site with Layout ── */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="produse" element={<Produse />} />
          <Route path="produse/:id" element={<ProductRezidential />} />
          <Route path="reduceri" element={<Reduceri />} />
          <Route path="termeni-si-conditii" element={<TermeniSiConditii />} />
          <Route path="termeni-si-conditii-programe-de-reducere" element={<TermeniSiConditiiProgrameReducere />} />
          <Route path="politica-confidentialitate" element={<PoliticaConfidentialitate />} />
          <Route path="siguranta" element={<Siguranta />} />
          <Route path="divizii/rezidential" element={<Rezidential />} />
          <Route path="divizii/industrial" element={<Industrial />} />
          <Route path="divizii/medical" element={<Medical />} />
          <Route path="divizii/maritim" element={<Maritim />} />
          <Route path="divizii/:slug" element={<Divizii />} />
          <Route path="parteneriat-strategic-lithtech-baterino" element={<LithTech />} />
          <Route path="instalatori" element={<Instalatori />} />
          <Route path="companie" element={<Companie />} />
          <Route path="companie/viziune" element={<Viziune />} />
          <Route path="companie/contact" element={<Navigate to="/companie" replace />} />
          <Route path="companie/:slug" element={<Companie />} />
          <Route path="cariere" element={<Cariere />} />
          <Route path="contact" element={<Navigate to="/companie" replace />} />
          <Route path="blog" element={<Blog />} />
          <Route path="typography" element={<Typography />} />
          <Route path="slider-examples" element={<SliderExamples />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </HelmetProvider>
  )
}
