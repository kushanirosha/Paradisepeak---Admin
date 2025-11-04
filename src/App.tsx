import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminHome from './pages/Adminhome';
import Packages from './pages/Packages';
import Gallery from './pages/Gallery';
import Subscribers from './pages/Subscribers';
import Reviews from './pages/Reviews';
import Login from "./pages/Login"
import Bookings from "./pages/Bookings"
import Signup from './pages/Signup';
import { AdminRoute, PublicRoute } from './services/Guard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
// import UserPhotoSubmission from './pages/user/UserPhotoSubmission';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import SharePhoto from './pages/SharePhoto';
import UsersPage from './pages/UsersPage';

function App() {
  return (
    <Router>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<PublicRoute element={<Login />} />} />
        <Route path="/signup" element={<PublicRoute element={<Signup />} />} />
        <Route path="/forgot" element={<PublicRoute element={<ForgotPassword />} />} />
        <Route path="/reset" element={<PublicRoute element={<ResetPassword />} />} />
        {/* <Route path="/Bookings" element={<PublicRoute element={<Bookings/>}/>}/> */}


        {/* ADMIN ROUTES */}
        <Route path="/home" element={<AdminHome />} />
        {/* <Route path="/home" element={<AdminRoute element={<AdminHome/>}/>}/> */}
        <Route path="/Gallery" element={<AdminRoute element={<Gallery />} />} />
        <Route path="/Packages" element={<AdminRoute element={<Packages />} />} />
        <Route path="/Bookings" element={<AdminRoute element={<Bookings />} />} />
        <Route path="/Reviews" element={<AdminRoute element={<Reviews />} />} />
        <Route path="/Subscribers" element={<AdminRoute element={<Subscribers />} />} />
        <Route path="/sharephotos" element={<AdminRoute element={<SharePhoto />} />} />
        <Route path="/users" element={<UsersPage />} />

      </Routes>
    </Router>
  );
}

export default App;
