import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home/Home';
import AuthPage from './pages/Auth/Auth';
import Signup from './components/auth/Signup';
import Login from './components/auth/login';
import VerifyEmail from './components/auth/VerifyEmail';
import './App.css'
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import GoogleCallback from './components/auth/GoogleCallback';
import Navbar from './components/Navbar/Navbar';
import PrivateRoute from './components/auth/PrivateRoute';
import Profile from './pages/Profile/Profile';
import ChangePassword from './components/auth/ChangePassword';
import Products from './pages/Products/Products';
import Footer from './components/Footer/Footer';
import ProductDetails from './pages/ProductDetails/ProductDetails';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<AuthPage />}>
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Signup />} />
            <Route path="verifyemail/:verificationToken" element={<VerifyEmail />} />
            <Route path="forgotpassword" element={<ForgotPassword />} />
            <Route path="resetpassword/:resetToken" element={<ResetPassword />} />
            <Route path="google/callback" element={<GoogleCallback />} />
          </Route>
          <Route 
            path="/profile" 
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="change-password"
            element={
              <PrivateRoute>
                <ChangePassword />
              </PrivateRoute>
            }
          />
          {/* <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          /> */}
          <Route path="/products" element={<Products />} />
          <Route path="/products/:category" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetails />} />
        </Routes>
        <Footer />
      </AuthProvider>
    </Router>
  )
}

export default App
