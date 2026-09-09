import { useEffect, type ReactElement } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { useAppStore } from './store/appStore'
import { DemoControls } from './components/common/DemoControls'
import { Toaster } from 'sonner'

/* Marketing */
import Landing from './pages/marketing/Landing'
import ContactSales from './pages/marketing/ContactSales'
import NotFound from './pages/NotFound'

/* Auth */
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import VerifyOtp from './pages/auth/VerifyOtp'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import AdminLogin from './pages/auth/AdminLogin'
import SessionExpired from './pages/auth/SessionExpired'

/* User */
import { UserLayout } from './layouts/UserLayout'
import UserDashboard from './pages/user/Dashboard'
import WalletPage from './pages/user/WalletPage'
import FundWallet from './pages/user/FundWallet'
import Transfer from './pages/user/Transfer'
import PaymentsHub from './pages/user/PaymentsHub'
import BillsHub from './pages/user/BillsHub'
import BillServicePage from './pages/user/BillServicePage'
import Transactions from './pages/user/Transactions'
import TransactionDetail from './pages/user/TransactionDetail'
import PaymentResultPage from './pages/user/PaymentResult'
import Beneficiaries from './pages/user/Beneficiaries'
import Notifications from './pages/user/Notifications'
import Profile from './pages/user/Profile'
import KycPage from './pages/user/KycPage'
import Security from './pages/user/Security'
import UserSettings from './pages/user/UserSettings'
import UserApiSettings from './pages/user/UserApiSettings'
import Support from './pages/user/Support'

/* Admin */
import { AdminLayout } from './layouts/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminCustomers from './pages/admin/AdminCustomers'
import AdminCustomerDetail from './pages/admin/AdminCustomerDetail'
import AdminTransactions from './pages/admin/AdminTransactions'
import AdminTransactionDetail from './pages/admin/AdminTransactionDetail'
import AdminPayments from './pages/admin/AdminPayments'
import AdminGatewayDetail from './pages/admin/AdminGatewayDetail'
import AdminWallets from './pages/admin/AdminWallets'
import AdminKyc from './pages/admin/AdminKyc'
import AdminReports from './pages/admin/AdminReports'
import AdminNotificationsPage from './pages/admin/AdminNotifications'
import AdminAuditLogs from './pages/admin/AdminAuditLogs'
import AdminSettingsPage from './pages/admin/AdminSettings'
import AdminProfilePage from './pages/admin/AdminProfile'
import AdminMerchants from './pages/admin/AdminMerchants'
import AdminMerchantDetail from './pages/admin/AdminMerchantDetail'
import AdminSettlements from './pages/admin/AdminSettlements'
import AdminApiClients from './pages/admin/AdminApiClients'
import AdminApiLogs from './pages/admin/AdminApiLogs'
import AdminWebhookMonitor from './pages/admin/AdminWebhookMonitor'
import AdminKyb from './pages/admin/AdminKyb'

/* Merchant */
import { MerchantLayout } from './layouts/MerchantLayout'
import MerchantLogin from './pages/merchant/MerchantLogin'
import MerchantOnboarding from './pages/merchant/MerchantOnboarding'
import MerchantDashboard from './pages/merchant/MerchantDashboard'
import MerchantPayments from './pages/merchant/MerchantPayments'
import MerchantPaymentDetail from './pages/merchant/MerchantPaymentDetail'
import MerchantRefunds from './pages/merchant/MerchantRefunds'
import MerchantSettlements from './pages/merchant/MerchantSettlements'
import MerchantIntegration from './pages/merchant/MerchantIntegration'
import MerchantApiKeys from './pages/merchant/MerchantApiKeys'
import MerchantWebhooks from './pages/merchant/MerchantWebhooks'
import MerchantTestConsole from './pages/merchant/MerchantTestConsole'
import MerchantApiLogs from './pages/merchant/MerchantApiLogs'
import MerchantTeam from './pages/merchant/MerchantTeam'
import MerchantSettings from './pages/merchant/MerchantSettings'

/* Developers */
import { DeveloperLayout } from './layouts/DeveloperLayout'
import DocsPage from './pages/developers/DocsPage'

function Require({ role, children }: { role: 'user' | 'admin' | 'merchant'; children: ReactElement }) {
  const currentRole = useAppStore((s) => s.role)
  const navigate = useNavigate()
  useEffect(() => {
    if (currentRole === role) return
    if (role === 'user') navigate('/login', { replace: true })
    else navigate('/admin/login', { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRole, role])
  if (currentRole !== role) return null
  return children
}

function AutoRedirect() {
  const location = useLocation()
  const navigate = useNavigate()
  const role = useAppStore((s) => s.role)
  useEffect(() => {
    if (location.pathname === '/') {
      navigate(role === 'user' ? '/app' : role === 'admin' ? '/admin' : role === 'merchant' ? '/merchant' : '/', { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role])
  return null
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function RedirectToIntroduction() {
  return <Navigate to="/developers/introduction" replace />
}

export default function App() {
  return (
    <>
      <Toaster richColors position="top-center" closeButton />
      <AutoRedirect />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/contact-support" element={<ContactSales />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/merchant/login" element={<MerchantLogin />} />
        <Route path="/merchant/onboarding" element={<MerchantOnboarding />} />
        <Route path="/session-expired" element={<SessionExpired />} />

        {/* Customer portal */}
        <Route path="/app" element={<Require role="user"><UserLayout /></Require>}>
          <Route index element={<UserDashboard />} />
          <Route path="wallet" element={<WalletPage />} />
          <Route path="wallet/fund" element={<FundWallet />} />
          <Route path="transfer" element={<Transfer />} />
          <Route path="payments" element={<PaymentsHub />} />
          <Route path="bills" element={<BillsHub />} />
          <Route path="bills/:service" element={<BillServicePage />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="transactions/:id" element={<TransactionDetail />} />
          <Route path="payment/success" element={<PaymentResultPage />} />
          <Route path="payment/pending" element={<PaymentResultPage />} />
          <Route path="payment/failed" element={<PaymentResultPage />} />
          <Route path="beneficiaries" element={<Beneficiaries />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile" element={<Profile />} />
          <Route path="profile/kyc" element={<KycPage />} />
          <Route path="profile/security" element={<Security />} />
          <Route path="settings" element={<UserSettings />} />
          <Route path="settings/api" element={<UserApiSettings />} />
          <Route path="support" element={<Support />} />
        </Route>

        {/* Admin portal */}
        <Route path="/admin" element={<Require role="admin"><AdminLayout /></Require>}>
          <Route index element={<AdminDashboard />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="customers/:id" element={<AdminCustomerDetail />} />
          <Route path="merchants" element={<AdminMerchants />} />
          <Route path="merchants/:id" element={<AdminMerchantDetail />} />
          <Route path="transactions" element={<AdminTransactions />} />
          <Route path="transactions/:id" element={<AdminTransactionDetail />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="payments/:id" element={<AdminGatewayDetail />} />
          <Route path="settlements" element={<AdminSettlements />} />
          <Route path="wallets" element={<AdminWallets />} />
          <Route path="kyc" element={<AdminKyc />} />
          <Route path="kyc/:id" element={<AdminKyc />} />
          <Route path="kyb" element={<AdminKyb />} />
          <Route path="api-clients" element={<AdminApiClients />} />
          <Route path="api-logs" element={<AdminApiLogs />} />
          <Route path="webhooks" element={<AdminWebhookMonitor />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="notifications" element={<AdminNotificationsPage />} />
          <Route path="audit-logs" element={<AdminAuditLogs />} />
          <Route path="settings" element={<AdminSettingsPage />} />
          <Route path="profile" element={<AdminProfilePage />} />
        </Route>

        {/* Merchant portal */}
        <Route path="/merchant" element={<Require role="merchant"><MerchantLayout /></Require>}>
          <Route index element={<MerchantDashboard />} />
          <Route path="payments" element={<MerchantPayments />} />
          <Route path="payments/:id" element={<MerchantPaymentDetail />} />
          <Route path="refunds" element={<MerchantRefunds />} />
          <Route path="settlements" element={<MerchantSettlements />} />
          <Route path="integration" element={<MerchantIntegration />} />
          <Route path="integration/api-keys" element={<MerchantApiKeys />} />
          <Route path="integration/webhooks" element={<MerchantWebhooks />} />
          <Route path="integration/test-console" element={<MerchantTestConsole />} />
          <Route path="integration/logs" element={<MerchantApiLogs />} />
          <Route path="team" element={<MerchantTeam />} />
          <Route path="settings" element={<MerchantSettings />} />
        </Route>

        {/* Developer documentation */}
        <Route path="/developers" element={<DeveloperLayout />}>
          <Route index element={<RedirectToIntroduction />} />
          <Route path="introduction" element={<DocsPage />} />
          <Route path="environments" element={<DocsPage />} />
          <Route path="authentication" element={<DocsPage />} />
          <Route path="quickstart" element={<DocsPage />} />
          <Route path="payments" element={<DocsPage />} />
          <Route path="verification" element={<DocsPage />} />
          <Route path="payment-details" element={<DocsPage />} />
          <Route path="refunds" element={<DocsPage />} />
          <Route path="webhooks" element={<DocsPage />} />
          <Route path="errors" element={<DocsPage />} />
          <Route path="testing" element={<DocsPage />} />
          <Route path="sdk" element={<DocsPage />} />
          <Route path="changelog" element={<DocsPage />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
      <DemoControls />
    </>
  )
}
