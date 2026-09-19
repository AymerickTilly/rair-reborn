import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import NavigationBar from './components/Navbar';
import PrivateRoutes from './routes/PrivateRoutes';
import ProtectedRoutes from './routes/ProtectedRoutes';
import ConfirmRegisterRoute from './routes/ConfirmRegisterRoute';
import { initAuth, useAuthStore } from './auth/AuthStore';
import AuthenticationRoutes from './routes/AuthenticationRoutes';
import LocationManager from './auth/LocationManager';
import ResetPasswordRoute from './routes/ResetPasswordRoute';
import ToastContainer from './components/ToastContainer';
import Spinner from './components/Spinner';

// Each page is its own chunk, loaded when the route is first visited, so a customer never downloads
// the admin screens (and the reverse).
const Login = lazy(() => import('./pages/Login'));
const RegisterForm = lazy(() => import('./pages/Register'));
const ConfirmRegisterForm = lazy(() => import('./pages/ConfirmRegister'));
const AskResetCode = lazy(() => import('./pages/AskResetCode'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Home = lazy(() => import('./pages/Home'));
const Shop = lazy(() => import('./pages/Shop'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const ListOrdersPage = lazy(() => import('./pages/ListOrdersPage'));
const Profile = lazy(() => import('./pages/Profile'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const AddItemPage = lazy(() => import('./pages/AddItemPage'));
const UpdateItemPage = lazy(() => import('./pages/UpdateItemPage'));

const App = () => {

  const { user } = useAuthStore();

  useEffect(() => {
    initAuth();

  }, []);

  return (
    <>
      <ToastContainer />
      <BrowserRouter>
        <LocationManager />
          {user && <NavigationBar />}
          <Suspense fallback={<Spinner />}>
          <Routes>
            {/* Public (Unauthenticated) Routes */}
            <Route element={<AuthenticationRoutes />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<RegisterForm />} />
            </Route>

            {/* Password Reset */}
            <Route element={<ResetPasswordRoute />}>
              <Route path="/askResetCode" element={<AskResetCode />} />
              <Route path="/resetPassword" element={<ResetPassword />} />
            </Route>

            {/* Confirm Register */}
            <Route element={<ConfirmRegisterRoute />}>
              <Route path="/confirmRegister" element={<ConfirmRegisterForm />} />
            </Route>

            {/* Protected (Authenticated) Routes */}
          <Route element={<ProtectedRoutes />}>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/listOrdersPage" element={<ListOrdersPage />} />
            <Route path="/checkout" element={<Checkout />} />

            {/* Admin-only Routes */}
            <Route element={<PrivateRoutes allowedGroups={['Admin']} />}>
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/admin/add-item" element={<AddItemPage />} />
              <Route path="/admin/update-item" element={<UpdateItemPage />} />
              <Route path="/admin/orders" element={<ListOrdersPage />} />
            </Route>

            {/* Customer-only Routes */}
            <Route element={<PrivateRoutes allowedGroups={['Customer']} />}>
              <Route path="/profile" element={<Profile />} />
            </Route>

            {/* Fallback for all protected routes */}
            <Route path="*" element={<Navigate to="/" />} />
          </Route>
        </Routes>
        </Suspense>
      </BrowserRouter>
    </>
  );
}

export default App;
