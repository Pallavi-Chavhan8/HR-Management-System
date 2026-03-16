import { useState } from "react";
import { Eye, EyeOff, Lock, Mail, ShieldCheck, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { APP_ROUTES } from "../../routes/routeConfig";
import { registerAdmin } from "../../services/authApi";
import { validateRegisterForm } from "../../utils/validation";
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

const RegisterPage = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => {
      if (!current[name]) {
        return current;
      }

      const next = { ...current };
      delete next[name];
      return next;
    });
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    const validationErrors = validateRegisterForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      await registerAdmin({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });
      navigate(APP_ROUTES.LOGIN, { replace: true });
    } catch (error) {
      if (error?.statusCode === 409) {
        setFieldErrors((current) => ({
          ...current,
          email: error.message || "Email already exists.",
        }));
      }
      setErrorMessage(error.message || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900" />

      <div className="absolute -top-32 -left-32 h-[480px] w-[480px] rounded-full bg-blue-500/20 blur-[100px]" />
      <div className="absolute -bottom-32 -right-32 h-[420px] w-[420px] rounded-full bg-indigo-500/20 blur-[100px]" />
      <div className="absolute top-1/2 left-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/10 blur-[80px]" />

      <div className="relative z-10 w-full max-w-md admin-fade-in">
        <div className="mb-6 flex justify-center">
          <div className="flex items-center gap-2.5 rounded-2xl border border-white/20 bg-white/10 px-5 py-2.5 shadow-lg backdrop-blur-sm">
            <ShieldCheck className="h-5 w-5 text-blue-300" />
            <span className="text-sm font-semibold tracking-wide text-white">
              HR Management System
            </span>
          </div>
        </div>

        <Card className="border border-white/10 bg-white/[0.07] shadow-2xl backdrop-blur-xl">
          <CardHeader className="pb-4 text-center">
            <CardTitle className="text-2xl font-bold tracking-tight text-white">
              Create admin account
            </CardTitle>
            <CardDescription className="text-slate-400">
              Register to access your admin dashboard
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleRegister} className="space-y-5" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-slate-300">
                  Full name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="name"
                    type="text"
                    name="name"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={handleChange}
                    autoComplete="name"
                    aria-invalid={Boolean(fieldErrors.name)}
                    className={`border-white/10 bg-white/10 pl-9 text-white placeholder:text-slate-500 focus-visible:border-blue-400 focus-visible:ring-blue-400/30 focus-visible:ring-offset-0 ${
                      fieldErrors.name ? "border-rose-500/60" : ""
                    }`}
                  />
                </div>
                {fieldErrors.name && <p className="text-xs text-rose-300">{fieldErrors.name}</p>}
              </div>

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
                    value={form.email}
                    onChange={handleChange}
                    autoComplete="email"
                    aria-invalid={Boolean(fieldErrors.email)}
                    className={`border-white/10 bg-white/10 pl-9 text-white placeholder:text-slate-500 focus-visible:border-blue-400 focus-visible:ring-blue-400/30 focus-visible:ring-offset-0 ${
                      fieldErrors.email ? "border-rose-500/60" : ""
                    }`}
                  />
                </div>
                {fieldErrors.email && <p className="text-xs text-rose-300">{fieldErrors.email}</p>}
              </div>

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
                    placeholder="Minimum 6 characters"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    aria-invalid={Boolean(fieldErrors.password)}
                    className={`border-white/10 bg-white/10 pl-9 pr-10 text-white placeholder:text-slate-500 focus-visible:border-blue-400 focus-visible:ring-blue-400/30 focus-visible:ring-offset-0 ${
                      fieldErrors.password ? "border-rose-500/60" : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-200"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {fieldErrors.password && <p className="text-xs text-rose-300">{fieldErrors.password}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-slate-300">
                  Confirm password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Re-enter password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                    aria-invalid={Boolean(fieldErrors.confirmPassword)}
                    className={`border-white/10 bg-white/10 pl-9 pr-10 text-white placeholder:text-slate-500 focus-visible:border-blue-400 focus-visible:ring-blue-400/30 focus-visible:ring-offset-0 ${
                      fieldErrors.confirmPassword ? "border-rose-500/60" : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-200"
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="text-xs text-rose-300">{fieldErrors.confirmPassword}</p>
                )}
              </div>

              {errorMessage && (
                <div className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2.5">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
                  <p className="text-xs font-medium text-rose-300">{errorMessage}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                size="lg"
                className="mt-2 w-full bg-gradient-to-r from-blue-600 to-indigo-600 font-semibold text-white shadow-lg shadow-blue-900/40 hover:from-blue-500 hover:to-indigo-500 hover:shadow-blue-900/60 disabled:opacity-60"
              >
                {isSubmitting ? "Creating account..." : "Register"}
              </Button>

              <p className="text-center text-xs text-slate-400">
                Already have an account?{" "}
                <Link className="font-semibold text-blue-300 hover:text-blue-200" to={APP_ROUTES.LOGIN}>
                  Sign in
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
