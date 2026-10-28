import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import Logo from "../../components/ui/Logo";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { useAuth } from "../../hooks/useAuth";
import { EMAIL_REGEX } from "../../utils/constants";
import { getErrorMessage } from "../../utils/format";

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const from = useLocation().state?.from?.pathname || "/admin";

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/admin" replace />;

  const submit = async (event) => {
    event.preventDefault();
    const found = {};
    if (!EMAIL_REGEX.test(form.email.trim())) found.email = "Enter a valid email address";
    if (!form.password) found.password = "Enter your password";
    setErrors(found);
    setServerError("");
    if (Object.keys(found).length) return;

    setLoading(true);
    try {
      const admin = await login({ email: form.email.trim(), password: form.password });
      toast.success(`Welcome back, ${admin.name.split(" ")[0]}`);
      navigate(from, { replace: true }); // success -> dashboard
    } catch (error) {
      setServerError(getErrorMessage(error, "Login failed. Try again."));
      setLoading(false);
    }
  };

  return (
    <div className="login-page" dir="ltr" lang="en">
      <motion.div
        className="login-card"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Logo />
        <div>
          <h1>Team login</h1>
          <p className="muted">Sign in to manage your leads.</p>
        </div>

        <form className="form-grid" onSubmit={submit} noValidate>
          {serverError && <div className="form-error" role="alert">{serverError}</div>}

          <Input
            label="Email"
            type="email"
            autoComplete="username"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            error={errors.email}
            placeholder="admin@mtec-eg.com"
          />

          <div className="pw">
            <Input
              label="Password"
              type={show ? "text" : "password"}
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              error={errors.password}
            />
            <button type="button" className="pw-toggle" onClick={() => setShow((v) => !v)} aria-label={show ? "Hide password" : "Show password"}>
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <Button type="submit" size="lg" block loading={loading}>Login</Button>
        </form>

        <Button to="/" variant="ghost" block>Back to website</Button>
      </motion.div>
    </div>
  );
}
