import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsCallerAdmin } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, LogIn, Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

export default function AdminLoginPage() {
  const { identity, login, loginStatus } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const navigate = useNavigate();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: any) {
      console.error('Login error:', error);
    }
  };

  // Loading state while checking admin status
  if (isAuthenticated && adminLoading) {
    return (
      <div className="container py-12 flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full">
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Verifying admin access...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Not logged in - show login prompt
  if (!isAuthenticated) {
    return (
      <div className="container py-12 flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Shield className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">Admin Portal</CardTitle>
            <CardDescription>
              Sign in with Internet Identity to access the admin area
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="w-full gap-2"
              size="lg"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  Sign In
                </>
              )}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Only authorized administrators can access this portal
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Logged in - show admin status
  return (
    <div className="container py-12 flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className={`p-3 rounded-full ${isAdmin ? 'bg-green-500/10' : 'bg-destructive/10'}`}>
              {isAdmin ? (
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              ) : (
                <XCircle className="h-8 w-8 text-destructive" />
              )}
            </div>
          </div>
          <CardTitle className="text-2xl">
            {isAdmin ? 'Admin Access Granted' : 'Access Denied'}
          </CardTitle>
          <CardDescription>
            {isAdmin
              ? 'You have administrator privileges'
              : 'Your account does not have administrator privileges'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isAdmin && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You are signed in, but your account does not have administrator access. 
                Only authorized users can access the admin dashboard.
              </AlertDescription>
            </Alert>
          )}
          
          {isAdmin ? (
            <>
              <Button
                onClick={() => navigate({ to: '/admin' })}
                className="w-full gap-2"
                size="lg"
              >
                <Shield className="h-5 w-5" />
                Go to Admin Dashboard
              </Button>
              <Button
                onClick={() => navigate({ to: '/' })}
                variant="outline"
                className="w-full"
              >
                Return to Home
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => navigate({ to: '/' })}
                className="w-full"
                size="lg"
              >
                Return to Home
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                If you believe you should have admin access, please contact the system administrator.
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
