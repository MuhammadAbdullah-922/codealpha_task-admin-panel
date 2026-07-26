import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import 'bootstrap/dist/css/bootstrap.min.css';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Layout from './components/layout/Layout';
import Messages from "./pages/Messages";

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Customers from './pages/Customers';
import Inventory from './pages/Inventory';
import Reports from './pages/Reports';
import Coupons from './pages/Coupons';
import Categories from "./pages/Categories";
import Newsletter from "./pages/Newsletter";
import FooterGallery from "./pages/FooterGallery";
import Settings from './pages/Settings';

function withLayout(PageComponent) {
  return (
    <ProtectedRoute>
      <Layout>{(setSidebarOpen) => <PageComponent setSidebarOpen={setSidebarOpen} />}</Layout>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ style: { fontSize: 13.5, fontFamily: 'Inter, sans-serif' } }} />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={withLayout(Dashboard)} />
          <Route path="/products" element={withLayout(Products)} />
          <Route path="/categories" element={withLayout(Categories)} />
          <Route path="/orders" element={withLayout(Orders)} />
        <Route path="/messages" element={withLayout(Messages)} />
          <Route path="/customers" element={withLayout(Customers)} />
          <Route path="/inventory" element={withLayout(Inventory)} />
          <Route path="/reports" element={withLayout(Reports)} />
       <Route path="/newsletter" element={withLayout(Newsletter)} />
          <Route path="/footer-gallery" element={withLayout(FooterGallery)} />
         
          <Route path="/coupons" element={withLayout(Coupons)} />
          <Route path="/settings" element={withLayout(Settings)} />
           

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
