import { Fragment } from 'react';
import DefaultLayout from '~/layouts/DefaultLayout';
import HRLayout from '~/layouts/HRLayout';
import AdminLayout from '~/layouts/AdminLayout';

// Import các trang (Đảm bảo đường dẫn import đúng với máy bro)
import Home from '~/pages/User/Home';
import CVBuilder from '~/pages/User/CVBuilder';
import ChatApp from '~/pages/Shared/Chat';
import HRDashboard from '~/pages/HR/Dashboard';
import JDOptimizer from '~/pages/HR/JDOptimizer';
import AdminDashboard from '~/pages/Admin/Dashboard';
import MatchedJobs from '~/pages/User/MatchedJobs';
import Companies from '~/pages/User/Companies';
import CompanyDetail from '~/pages/User/CompanyDetail';
import HRRegister from '~/pages/User/HRRegister';
import Login from '~/pages/Auth/Login';
import SignUp from '~/pages/Auth/SignUp';
import Jobs from '~/pages/User/Jobs';
import ChangePassword from '~/pages/User/ChangePassword';
import Profile from '~/pages/User/Profile';
import ManageJobs from '~/pages/HR/ManageJobs';
import SearchCandidates from '~/pages/HR/SearchCandidates';
import HRChat from '~/pages/HR/Chat';
import ForgotPassword from '~/pages/Auth/ForgotPassword';
import HRSettings from '~/pages/HR/Settings';
import AdminCompanies from '~/pages/Admin/Companies';
import AdminAI from '~/pages/Admin/AIModels';
import AdminUsers from '~/pages/Admin/Users';
import AdminContent from '~/pages/Admin/Content';
import AdminModeration from '~/pages/Admin/Moderation';
import AdminPricing from '~/pages/Admin/Pricing';
import JobDetail from '~/pages/User/JobDetail';
import ManageJob from '~/pages/User/ManageJobs';
import CVEditor from '~/pages/User/CVEditor';
import EditJob from '~/pages/HR/EditJob';
import Candidates from '~/pages/HR/Candidates';
import Pricing from '~/pages/User/Pricing';
import PaymentResult from '~/pages/User/PaymentResult';
import HRPricing from '~/pages/HR/Pricing';
import CandidateDetail from '~/pages/HR/CandidateDetail';
// Các trang dùng Header mặc định
const publicRouters = [
    { path: '/', component: Home, layout: DefaultLayout },
    { path: '/cv-builder', component: CVBuilder, layout: DefaultLayout },
    { path: '/matched-jobs', component: MatchedJobs, layout: DefaultLayout },
    { path: '/chat', component: ChatApp, layout: DefaultLayout },
    { path: '/companies', component: Companies, layout: DefaultLayout },
    { path: '/companies/:id', component: CompanyDetail, layout: DefaultLayout },
    { path: '/jobs', component: Jobs, layout: DefaultLayout },
    { path: '/change-password', component: ChangePassword, layout: DefaultLayout },
    { path: '/profile', component: Profile, layout: DefaultLayout },
    { path: '/jobs/:id', component: JobDetail, layout: DefaultLayout },
    { path: '/manage-jobs', component: ManageJob, layout: DefaultLayout },
    { path: '/cv-builder/editor/:id', component: CVEditor, layout: Fragment },
    { path: '/pricing', component: Pricing, layout: DefaultLayout },
    { path: '/payment/callback', component: PaymentResult, layout: DefaultLayout },

    // HR Routes
    { path: '/hr/pricing', component: HRPricing, layout: HRLayout },
    { path: '/hr/dashboard', component: HRDashboard, layout: HRLayout },
    { path: '/hr/jd-optimizer', component: JDOptimizer, layout: HRLayout },
    { path: '/hr-register', component: HRRegister, layout: DefaultLayout },
    { path: '/hr/manage-jobs', component: ManageJobs, layout: HRLayout },
    { path: '/hr/search-candidates', component: SearchCandidates, layout: HRLayout },
    { path: '/hr/chat', component: HRChat, layout: HRLayout },
    { path: '/hr/settings', component: HRSettings, layout: HRLayout },
    { path: '/hr/candidates/:id', component: CandidateDetail, layout: HRLayout },
    { path: '/hr/edit-job/:id', component: EditJob, layout: HRLayout },
    { path: '/hr/candidates', component: Candidates, layout: HRLayout },

    // Admin có sidebar riêng, không dùng Header mặc định
    { path: '/admin/dashboard', component: AdminDashboard, layout: AdminLayout },
    { path: '/admin/companies', component: AdminCompanies, layout: AdminLayout },
    { path: '/admin/ai-models', component: AdminAI, layout: AdminLayout },
    { path: '/admin/users', component: AdminUsers, layout: AdminLayout },
    { path: '/admin/content', component: AdminContent, layout: AdminLayout },
    { path: '/admin/moderation', component: AdminModeration, layout: AdminLayout },
    { path: '/admin/pricing', component: AdminPricing, layout: AdminLayout }, // <-- Thêm route cho Admin Pricing

    // Auth Routes
    { path: '/login', component: Login, layout: Fragment },
    { path: '/register', component: SignUp, layout: Fragment },
    { path: '/forgot-password', component: ForgotPassword, layout: Fragment },
];

export { publicRouters };
