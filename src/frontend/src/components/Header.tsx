import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Briefcase, LogIn, LogOut, Shield, Users, Home, Info, Mail, Building2 } from 'lucide-react';
import { useIsCallerAdmin, useGetCallerUserProfile } from '../hooks/useQueries';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { AccountType } from '../backend';

export default function Header() {
  const { identity, login, clear, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: isAdmin } = useIsCallerAdmin();
  const { data: userProfile } = useGetCallerUserProfile();
  const navigate = useNavigate();
  const routerState = useRouterState();

  const isAuthenticated = !!identity;
  const currentPath = routerState.location.pathname;
  const isCompany = userProfile?.accountType === AccountType.company;

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      navigate({ to: '/' });
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const handleAdminClick = () => {
    // Route to /admin only if authenticated and admin, otherwise to /admin-login
    if (isAuthenticated && isAdmin) {
      navigate({ to: '/admin' });
    } else {
      navigate({ to: '/admin-login' });
    }
  };

  const disabled = loginStatus === 'logging-in';
  const buttonText = loginStatus === 'logging-in' ? 'Logging in...' : isAuthenticated ? 'Logout' : 'Login';

  const isAdminPath = currentPath === '/admin' || currentPath === '/admin-login' || currentPath.startsWith('/admin/');

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Briefcase className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">The Bridge Project</h1>
        </div>

        <nav className="flex items-center gap-2 md:gap-4">
          <Button
            variant={currentPath === '/' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => navigate({ to: '/' })}
            className="gap-2"
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Home</span>
          </Button>

          <Button
            variant={isAdminPath ? 'default' : 'secondary'}
            size="sm"
            onClick={handleAdminClick}
            className="gap-2"
          >
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Admin</span>
          </Button>

          <Button
            variant={currentPath === '/internships' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => navigate({ to: '/internships' })}
            className="gap-2"
          >
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Browse</span>
          </Button>

          <Button
            variant={currentPath === '/about' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => navigate({ to: '/about' })}
            className="gap-2"
          >
            <Info className="h-4 w-4" />
            <span className="hidden sm:inline">About</span>
          </Button>

          <Button
            variant={currentPath === '/contact' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => navigate({ to: '/contact' })}
            className="gap-2"
          >
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">Contact</span>
          </Button>

          {isAuthenticated && isCompany && (
            <Button
              variant={currentPath === '/company' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => navigate({ to: '/company' })}
              className="gap-2"
            >
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Company Portal</span>
            </Button>
          )}

          <Button
            onClick={handleAuth}
            disabled={disabled}
            variant={isAuthenticated ? 'outline' : 'default'}
            size="sm"
            className="gap-2"
          >
            {isAuthenticated ? (
              <>
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">{buttonText}</span>
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">{buttonText}</span>
              </>
            )}
          </Button>
        </nav>
      </div>
    </header>
  );
}
