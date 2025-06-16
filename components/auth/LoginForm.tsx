import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';

type FormMode = 'signin' | 'signup';

type LoginFormProps = {
  initialMode?: FormMode;
};

export default function LoginForm({ initialMode = 'signin' }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [mode, setMode] = useState<FormMode>(initialMode);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const router = useRouter();
  
  // Force redirect after successful login
  useEffect(() => {
    if (loginSuccess) {
      const timer = setTimeout(() => {
        // Use location.replace for cleaner navigation without browser history issues
        console.log("LoginForm - Login successful, redirecting to home");
        window.location.replace("/");
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [loginSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signin') {
        await signIn(email, password);
        setLoginSuccess(true);
        // Redirect will be handled by the useEffect
      } else {
        await signUp(email, password, displayName);
        setRegistrationSuccess(true);
        // Automatically switch to sign in after registration
        setTimeout(() => {
          setMode('signin');
          setRegistrationSuccess(false);
          router.push('/login');
        }, 3000);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    setError('');
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-zinc-900 border border-blue-800/60 shadow-lg shadow-blue-900/20">
      <CardHeader className="border-b border-zinc-800">
        <CardTitle className="text-blue-500">{mode === 'signin' ? 'Sign In' : 'Create Account'}</CardTitle>
        <CardDescription className="text-zinc-400">
          {mode === 'signin' 
            ? 'Enter your credentials to access your account' 
            : 'Create a new account to get started'}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {registrationSuccess ? (
          <Alert className="bg-blue-900/30 text-blue-300 border border-blue-800/50">
            <AlertDescription>
              Registration successful! Please check your email to confirm your account. Redirecting to login page...
            </AlertDescription>
          </Alert>
        ) : loginSuccess ? (
          <Alert className="bg-blue-900/30 text-blue-300 border border-blue-800/50">
            <AlertDescription>
              Login successful! You will be redirected shortly...
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive" className="bg-red-900/40 border-red-800/50">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-zinc-300">Display Name</Label>
                <Input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  required={mode === 'signup'}
                  className="border-zinc-800 bg-zinc-800 focus:border-blue-700 focus:ring-blue-800/20 text-zinc-200 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="border-zinc-800 bg-zinc-800 focus:border-blue-700 focus:ring-blue-800/20 text-zinc-200 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-300">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="border-zinc-800 bg-zinc-800 focus:border-blue-700 focus:ring-blue-800/20 text-zinc-200 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-blue-50 shadow-md" 
              disabled={loading}
            >
              {loading ? 'Loading...' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter className="border-t border-zinc-800">
        <Button 
          variant="link" 
          className="w-full text-blue-500/90 hover:text-blue-400" 
          onClick={toggleMode} 
          disabled={registrationSuccess || loginSuccess}
        >
          {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </Button>
      </CardFooter>
    </Card>
  );
} 