import './App.css';
import { Routes, Route } from 'react-router-dom';
import SignIn from './views/signin/page';
import { Toaster } from 'react-hot-toast';
import Dashboard from './views/dashboard';
import ProtectedRoute from './utils/ProtectedRoute';
import Bookings from './views/bookings/index';
import SingleMeal from './views/meal/page';
import Services from './views/services/index';
import SingleRecipe from './views/recipe/page';
import AppSettings from './views/app-settings/page';
import UserReport from './views/user-reports/page';
import ReportedChats from './views/user-reported-chat/page';
import Feedbacks from './views/feedback/page';
import Contact from './views/contacts/page';
import Users from './views/users/page';
import SingleUser from './views/user/page';
import Admins from './views/admin';
import AddServiceType from './views/addServiceType';
import ServiceTypes from './views/serviceType';
import FAQManagement from './views/admin/faq-management';
import SingleService from './views/service/page';
import Payments from './views/payments/page';
import SinglePaymentView from './views/payment/page';
import SingleBooking from './views/booking/page';
import PrivacyPolicy from './views/privacyPolicy.jsx/page';
import TermsOfService from './views/termsOfService/page';
import ServiceCategoriesPage from './views/service-categories';

function App() {
  return (
    <>
      <Routes>
        <Route path="/auth" element={<SignIn />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-conditions" element={<TermsOfService />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings"
          element={
            <ProtectedRoute>
              <Bookings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking/:id"
          element={
            <ProtectedRoute>
              <SingleBooking />
            </ProtectedRoute>
          }
        />
        <Route
          path="/meal/:id"
          element={
            <ProtectedRoute>
              <SingleMeal />
            </ProtectedRoute>
          }
        />
        <Route
          path="/services"
          element={
            <ProtectedRoute>
              <Services />
            </ProtectedRoute>
          }
        />
        <Route
          path="/service/:id"
          element={
            <ProtectedRoute>
              <SingleService />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recipe/:id"
          element={
            <ProtectedRoute>
              <SingleRecipe />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app-settings"
          element={
            <ProtectedRoute>
              <AppSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user-reports"
          element={
            <ProtectedRoute>
              <UserReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chats/:id/:reportedUserId"
          element={
            <ProtectedRoute>
              <ReportedChats />
            </ProtectedRoute>
          }
        />
        <Route
          path="/feedback"
          element={
            <ProtectedRoute>
              <Feedbacks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contacts"
          element={
            <ProtectedRoute>
              <Contact />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <Users />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/:id"
          element={
            <ProtectedRoute>
              <SingleUser />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Admins />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-service-type"
          element={
            <ProtectedRoute>
              <AddServiceType />
            </ProtectedRoute>
          }
        />
        <Route
          path="/service-types"
          element={
            <ProtectedRoute>
              <ServiceTypes />
            </ProtectedRoute>
          }
        />
        <Route
          path="service-type/:id"
          element={
            <ProtectedRoute>
              <AddServiceType />
            </ProtectedRoute>
          }
        />
        <Route
          path="faq-management"
          element={
            <ProtectedRoute>
              <FAQManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="payments"
          element={
            <ProtectedRoute>
              <Payments />
            </ProtectedRoute>
          }
        />
        <Route
          path="payment/:id"
          element={
            <ProtectedRoute>
              <SinglePaymentView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/service-categories"
          element={
            <ProtectedRoute>
              <ServiceCategoriesPage />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Toaster position="top-right" reverseOrder={false} />
    </>
  );
}

export default App;
