'use client';

import { Suspense, useEffect, useState } from 'react';
import { Github, User } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [enableGithub, setEnableGithub] = useState(false);

  // Check for NextAuth errors from redirect
  useEffect(() => {
    const errorParam = searchParams?.get('error');
    if (errorParam) {
      console.error('[LoginPage] Auth error from NextAuth:', errorParam);
      setError('Authentication failed. Please try again.');
    }
  }, [searchParams]);

  // Load GitHub auth enabled status from /api/health-auth
  useEffect(() => {
    const checkGithubAuth = async () => {
      try {
        const response = await fetch('/api/health-auth');
        if (response.ok) {
          const data = await response.json();
          // Check both hasGitHub (credentials present) AND githubAuthEnabled (feature flag)
          setEnableGithub(data.hasGitHub === true && data.githubAuthEnabled === true);
        }
      } catch (err) {
        console.error('[LoginPage] Failed to check GitHub auth status:', err);
      }
    };
    checkGithubAuth();
  }, []);

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
        callbackUrl: '/projects',
      });

      if (result?.error) {
        console.error('[LoginPage] Credentials login error:', result.error);
        // Show generic error message for security
        setError('Invalid username or password');
      } else if (result?.ok) {
        // Login successful - redirect to projects
        router.push('/projects');
        router.refresh();
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#151515] text-foreground flex items-center justify-center">
      <Card className="w-full max-w-md bg-card border-border">
        <CardHeader>
          <CardTitle className="text-2xl text-card-foreground mx-auto">
            Welcome to Fulling
          </CardTitle>
          <CardDescription className="text-muted-foreground text-center">
            You&apos;re one click away from creating your own full-stack app.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleCredentialsLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-secondary-foreground">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="your-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="bg-secondary border-input text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-secondary-foreground">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="bg-secondary border-input text-foreground"
              />
            </div>

            {error && <p className="text-destructive text-sm text-center">{error}</p>}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary-hover text-primary-foreground rounded-md"
              size="lg"
            >
              <User className="mr-2 h-5 w-5" />
              {isLoading ? 'Signing in...' : 'Sign in / Register'}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Don&apos;t have an account? Just enter your credentials and we&apos;ll create one for
              you.
            </p>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          {enableGithub ? (
            <Button
              onClick={() => signIn('github', { callbackUrl: '/projects' })}
              className="w-full bg-secondary text-secondary-foreground hover:bg-muted rounded-md"
              size="lg"
              variant="outline"
            >
              <Github className="mr-2 h-5 w-5" />
              Continue with GitHub
            </Button>
          ) : (
            <div className="text-xs text-muted-foreground text-center p-3 bg-secondary/50 rounded-md border border-border">
              GitHub login is not configured. Contact your administrator or set
              ENABLE_GITHUB_AUTH=true.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#151515]" />}>
      <LoginContent />
    </Suspense>
  );
}
