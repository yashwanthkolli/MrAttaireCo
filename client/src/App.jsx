import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home/Home';
import AuthPage from './pages/Auth/Auth';
import Signup from './components/auth/Signup';
import Login from './components/auth/Login';
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
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import Wishlist from './pages/Wishlist/Wishlist';
import Cart from './pages/Cart/Cart';
import SearchResults from './pages/SearchResults/SearchResults';
import Carousel from './components/Carousel/Carousel';
import AboutUs from './pages/AboutUs/AboutUs';
import FAQs from './pages/Faqs/Faqs';
import TermsAndConditions from './pages/Policies/TermsAndConditions';
import Refund from './pages/Policies/Refund';
import Address from './pages/Address/Address';
import Checkout from './pages/Checkout/Checkout';
import Privacy from './pages/Policies/Privacy';
import Shipping from './pages/Policies/Shipping';
import OrderConfirmation from './pages/OrderConfirmation/OrderConfirmation';
import UserOrders from './pages/UserOrders/UserOrders';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Carousel />
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
                path="/addresses" 
                element={
                  <PrivateRoute>
                    <Address />
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
              <Route path="/products/search" element={<SearchResults />} />
              <Route path="/products/:category" element={<Products />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/pages/aboutus" element={<AboutUs />} />
              <Route path="/pages/FAQs" element={<FAQs />} />
              <Route path="/pages/termsandconditions" element={<TermsAndConditions />} />
              <Route path="/pages/refundpolicy" element={<Refund />} />
              <Route path="/pages/privacypolicy" element={<Privacy />} />
              <Route path="/pages/shippinganddelivery" element={<Shipping />} />

              <Route 
                path="/checkout"
                element={
                  <PrivateRoute>
                    <Checkout />
                  </PrivateRoute>
                }
              />
              <Route 
                path="/order-confirmation/:orderId"
                element={
                  <PrivateRoute>
                    <OrderConfirmation />
                  </PrivateRoute>
                }
              />
              <Route 
                path="/orders"
                element={
                  <PrivateRoute>
                    <UserOrders />
                  </PrivateRoute>
                }
              />
            </Routes>
            <Footer />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
