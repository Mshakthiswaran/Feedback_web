import { Routes, Route } from 'react-router-dom';
import Login from '../pages/auth/Login.jsx';
import Register from '../pages/auth/Register.jsx';
import Dashboard from '../pages/professor/Dashboard.jsx';
import MyForms from '../pages/professor/MyForms.jsx';
import CreateForm from '../pages/professor/CreateForm.jsx';
import EditForm from '../pages/professor/EditForm.jsx';
import FormResults from '../pages/professor/FormResults.jsx';
import Profile from '../pages/professor/Profile.jsx';
import AdminPanel from '../pages/admin/AdminPanel.jsx';
import FeedbackForm from '../pages/student/FeedbackForm.jsx';
import ThankYouPage from '../pages/student/ThankYouPage.jsx';
import NotFound from '../pages/NotFound.jsx';
import { useAuthStore } from '../store/slices/authSlice.js';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
    const user = useAuthStore((state) => state.user);
    if (!user || user.role !== 'admin') {
        return <Navigate to="/dashboard" replace />;
    }
    return children;
};

const AppRoutes = () => {
    return (
        <Routes>
            {/* Auth */}
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Professor */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/forms" element={<MyForms />} />
            <Route path="/dashboard/create" element={<CreateForm />} />
            <Route path="/dashboard/edit/:formId" element={<EditForm />} />
            <Route path="/dashboard/results/:formId" element={<FormResults />} />
            <Route path="/dashboard/profile" element={<Profile />} />

            {/* Admin */}
            <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />

            {/* Student / Public */}
            <Route path="/feedback/form/:formId" element={<FeedbackForm />} />
            <Route path="/feedback/thank-you" element={<ThankYouPage />} />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

export default AppRoutes;
