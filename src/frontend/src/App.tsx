import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from './hooks/useQueries';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import PublicPage from './pages/PublicPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminCompanySubmissionsPage from './pages/AdminCompanySubmissionsPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import CompanyPortalPage from './pages/CompanyPortalPage';
import ProfileSetupModal from './components/ProfileSetupModal';
import RouteGuard from './components/RouteGuard';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import { RouterProvider, createRouter, createRootRoute, createRoute, Outlet } from '@tanstack/react-router';
import type { UserProfile } from './backend';

// Layout component that includes Header and Footer
function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

// Root component with hooks
function RootComponent() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { mutate: saveProfile } = useSaveCallerUserProfile();

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  const handleProfileSave = (profile: UserProfile) => {
    saveProfile(profile);
  };

  return (
    <>
      <Layout>
        <Outlet />
      </Layout>
      {showProfileSetup && <ProfileSetupModal onSave={handleProfileSave} />}
      <Toaster />
    </>
  );
}

// Root route with layout
const rootRoute = createRootRoute({
  component: RootComponent,
});

// Home route
const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

// Public page route with optional category filter
const publicRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/internships',
  component: PublicPage,
});

// Admin login portal route
const adminLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin-login',
  component: AdminLoginPage,
});

// Admin dashboard route with guard
const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: () => (
    <RouteGuard requireAdmin>
      <AdminDashboard />
    </RouteGuard>
  ),
});

// Admin company submissions route with guard
const adminCompanySubmissionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/company-submissions',
  component: () => (
    <RouteGuard requireAdmin>
      <AdminCompanySubmissionsPage />
    </RouteGuard>
  ),
});

// Company portal route with guard
const companyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/company',
  component: () => (
    <RouteGuard requireCompany>
      <CompanyPortalPage />
    </RouteGuard>
  ),
});

// About page route
const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/about',
  component: AboutPage,
});

// Contact page route
const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/contact',
  component: ContactPage,
});

// Create router
const routeTree = rootRoute.addChildren([
  homeRoute,
  publicRoute,
  adminLoginRoute,
  adminRoute,
  adminCompanySubmissionsRoute,
  companyRoute,
  aboutRoute,
  contactRoute,
]);
const router = createRouter({ routeTree });

// Type declaration for router
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
