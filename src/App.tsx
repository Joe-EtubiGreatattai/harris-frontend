import { BrowserRouter, Routes, Route } from "react-router-dom"
import { MainLayout } from "./components/layout/MainLayout"
import { HomePage } from "./pages/HomePage"
import { ProductPage } from "./pages/ProductPage"
import { CartPage } from "./pages/CartPage"
import { TrackingPage } from "./pages/TrackingPage"

import { CartProvider } from "./context/CartContext"

import { UserProvider } from "./context/UserContext"

import { ProfilePage } from "./pages/ProfilePage"
import { PaymentCallbackPage } from "./pages/PaymentCallbackPage"
import { AdminPage } from './pages/AdminPage';
import { LoginPage } from "./pages/LoginPage"
import { RiderPanel } from "./pages/RiderPanel"
import { ProtectedRoute } from "./components/auth/ProtectedRoute"
import { Toaster } from "./components/ui/toaster"
import { OrderUpdateHandler } from "./components/notifications/OrderUpdateHandler"
import { OfflineBanner } from "./components/layout/OfflineBanner"

function App() {
  return (
    <UserProvider>
      <CartProvider>
        <Toaster />
        <OrderUpdateHandler />
        <OfflineBanner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/rider" element={<RiderPanel />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/admin" element={<AdminPage />} />
            </Route>
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/product/:id" element={<ProductPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/payment/callback" element={<PaymentCallbackPage />} />
              <Route path="/tracking" element={<TrackingPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </UserProvider>
  )
}

export default App
