import { useState } from "react";
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { APP_ROUTES } from "../../routes/routeConfig";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

const LoginPage = () => {
  const { login } = useAuth();
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setCredentials((current) => ({ ...current, [name]: value }));
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await login(credentials);
      navigate(APP_ROUTES.DASHBOARD, { replace: true });
    } catch (error) {
      setErrorMessage(error.message || "Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900" />

      {/* Decorative blurred orbs */}
      <div className="absolute -top-32 -left-32 h-[480px] w-[480px] rounded-full bg-blue-500/20 blur-[100px]" />
      <div className="absolute -bottom-32 -right-32 h-[420px] w-[420px] rounded-full bg-indigo-500/20 blur-[100px]" />
      <div className="absolute top-1/2 left-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/10 blur-[80px]" />

      {/* Login card */}
      <div className="relative z-10 w-full max-w-md admin-fade-in">
        {/* Logo badge */}
        <div className="mb-6 flex justify-center">
          <div className="flex items-center gap-2.5 rounded-2xl bg-white/10 px-5 py-2.5 backdrop-blur-sm border border-white/20 shadow-lg">
            <ShieldCheck className="h-5 w-5 text-blue-300" />
            <span className="text-sm font-semibold tracking-wide text-white">
              HR Management System
            </span>
          </div>
        </div>

        <Card className="border border-white/10 bg-white/[0.07] shadow-2xl backdrop-blur-xl">
          <CardHeader className="pb-4 text-center">
            <CardTitle className="text-2xl font-bold tracking-tight text-white">
              Welcome back
            </CardTitle>
            <CardDescription className="text-slate-400">
              Sign in to your admin dashboard
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-5" noValidate>
              {/* Email field */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-slate-300">
                  Email address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="admin@company.com"
                    value={credentials.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                    className="border-white/10 bg-white/10 pl-9 text-white placeholder:text-slate-500 focus-visible:border-blue-400 focus-visible:ring-blue-400/30 focus-visible:ring-offset-0"
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-slate-300">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    value={credentials.password}
                    onChange={handleChange}
                    required
                    autoComplete="current-password"
                    className="border-white/10 bg-white/10 pl-9 pr-10 text-white placeholder:text-slate-500 focus-visible:border-blue-400 focus-visible:ring-blue-400/30 focus-visible:ring-offset-0"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error message */}
              {errorMessage && (
                <div className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2.5">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
                  <p className="text-xs font-medium text-rose-300">{errorMessage}</p>
                </div>
              )}

              {/* Submit button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                size="lg"
                className="mt-2 w-full bg-gradient-to-r from-blue-600 to-indigo-600 font-semibold text-white shadow-lg shadow-blue-900/40 hover:from-blue-500 hover:to-indigo-500 hover:shadow-blue-900/60 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Signing in…
                  </span>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer note */}
        <p className="mt-6 text-center text-xs text-slate-500">
          Protected area · Authorized personnel only
        </p>
        <p className="mt-2 text-center text-xs text-slate-400">
          New admin?{" "}
          <Link className="font-semibold text-blue-300 hover:text-blue-200" to={APP_ROUTES.REGISTER}>
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
