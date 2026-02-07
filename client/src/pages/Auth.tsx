import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import api from "../services/api";
import { Sparkles, Zap, Shield } from "lucide-react";
import zxcvbn from "zxcvbn";

const StatCard = ({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) => (
  <div className="flex flex-col items-center text-center">
    <div className="text-primary-400 mb-2">{icon}</div>
    <p className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
      {value}
    </p>
    <p className="text-sm text-gray-500">{label}</p>
  </div>
);

const PasswordStrengthMeter = ({ password }: { password: string }) => {
  const { score, feedback } = useMemo(() => {
    const result = zxcvbn(password);
    return {
      score: result.score,
      feedback:
        result.feedback.warning ||
        (result.feedback.suggestions.length > 0
          ? result.feedback.suggestions[0]
          : ""),
    };
  }, [password]);

  const strengthLevels = [
    { label: "Very Weak", color: "bg-red-500" },
    { label: "Weak", color: "bg-yellow-500" },
    { label: "Fair", color: "bg-blue-500" },
    { label: "Good", color: "bg-green-500" },
    { label: "Strong", color: "bg-green-500" },
  ];

  const getBarColor = (index: number) => {
    if (password.length === 0) return "bg-dark-700";
    return index <= score ? strengthLevels[score].color : "bg-dark-700";
  };

  return (
    <div className="mt-2">
      <div className="flex justify-between gap-1">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full ${getBarColor(i)} transition-colors`}
            ></div>
          ))}
      </div>
      {password.length > 0 && (
        <p
          className={`text-xs mt-1 ${score < 2 ? "text-red-400" : "text-green-400"}`}
        >
          Strength: {strengthLevels[score].label}. {feedback}
        </p>
      )}
    </div>
  );
};

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setSuccessMessage(
        "Registration successful! Please log in with your credentials.",
      );
      setIsLogin(true);
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === "password" || e.target.name === "confirmPassword") {
      setError(null);
    }
    setSuccessMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    console.log("Auth form submitted, isLogin:", isLogin);

    if (!isLogin) {
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      const passwordStrength = zxcvbn(formData.password);
      if (passwordStrength.score < 2) {
        setError("Password is too weak. Please choose a stronger one.");
        return;
      }
    }

    const endpoint = isLogin ? "/auth/login" : "/auth/register";
    console.log("Sending request to:", endpoint);

    try {
      const res = await api.post(endpoint, {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      console.log("Auth response received:", res.data);

      if (isLogin && res.data.token) {
        console.log(
          "Login successful, saving token and navigating to dashboard",
        );
        login(res.data.token);
        // Update last login
        await api.post("/auth/update-login");
        navigate("/");
      } else if (!isLogin) {
        console.log("Registration successful, redirecting to login");
        setFormData({
          username: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
        navigate("/auth?registered=true", { replace: true });
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      const errorMsg =
        err.response?.data?.msg ||
        err.response?.data?.errors?.map((e) => e.msg).join(", ") ||
        "Authentication failed. Please ensure the backend server is running.";
      setError(errorMsg);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-30"></div>
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-20 right-20 w-96 h-96 bg-accent-600/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="relative z-10 min-h-screen grid grid-cols-1 lg:grid-cols-2">
        {/* Left Side */}
        <div className="hidden lg:flex flex-col justify-center items-center p-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-7xl font-display font-bold mb-4">
              <span className="bg-gradient-to-r from-primary-400 via-accent-400 to-primary-400 bg-clip-text text-transparent">
                SynthAug
              </span>
            </h1>
            <p className="text-xl text-gray-400">
              AI-Powered Dataset Augmentation
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="w-full flex justify-around text-center"
          >
            <StatCard
              icon={<Sparkles size={28} />}
              value="1.2M+"
              label="Images Generated"
            />
            <StatCard
              icon={<Zap size={28} />}
              value="4K+"
              label="Projects Completed"
            />
            <StatCard
              icon={<Shield size={28} />}
              value="99.8%"
              label="Accuracy"
            />
          </motion.div>
        </div>

        {/* Right Side - Form */}
        <div className="flex flex-col justify-center items-center p-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md"
          >
            <div className="glass-panel p-8">
              <h2 className="text-3xl font-display font-bold text-center mb-2">
                <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                  {isLogin ? "Welcome Back" : "Get Started"}
                </span>
              </h2>
              <p className="text-center text-gray-400 mb-8">
                {isLogin ? "Sign in to continue" : "Create your account"}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="w-full bg-dark-800/50 border border-dark-700 rounded-xl p-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition placeholder:text-gray-600"
                  />
                )}
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-dark-800/50 border border-dark-700 rounded-xl p-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition placeholder:text-gray-600"
                />
                <div>
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full bg-dark-800/50 border border-dark-700 rounded-xl p-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition placeholder:text-gray-600"
                  />
                  {!isLogin && (
                    <PasswordStrengthMeter password={formData.password} />
                  )}
                </div>
                {!isLogin && (
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full bg-dark-800/50 border border-dark-700 rounded-xl p-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition placeholder:text-gray-600"
                  />
                )}

                {error && (
                  <p className="text-red-400 text-sm text-center py-2">
                    {error}
                  </p>
                )}
                {successMessage && (
                  <p className="text-green-400 text-sm text-center py-2">
                    {successMessage}
                  </p>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full btn-primary"
                >
                  {isLogin ? "Sign In" : "Create Account"}
                </motion.button>
              </form>

              <p className="text-center text-sm text-gray-400 mt-6">
                {isLogin
                  ? "Don't have an account? "
                  : "Already have an account? "}
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  className="font-semibold text-primary-400 hover:text-primary-300 transition"
                >
                  {isLogin ? "Sign Up" : "Sign In"}
                </button>
              </p>
            </div>
            <div className="text-center mt-8 text-xs text-gray-600">
              By continuing, you agree to our{" "}
              <Link to="/terms" className="underline hover:text-gray-400">
                Terms
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="underline hover:text-gray-400">
                Privacy Policy
              </Link>
              .
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
