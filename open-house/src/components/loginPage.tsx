import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { InputField } from "../utils/InputField";
import PrimaryButton from "../utils/PrimaryButton";
import { SocialButton } from "../utils/SocialButton";
import { loginPageConstants } from "../common/constants";


const getStoredToken = () => localStorage.getItem(loginPageConstants.AUTH_TOKEN_KEY);

const setAuthToken = (token: string | null) => {
  if (token) {
    localStorage.setItem(loginPageConstants.AUTH_TOKEN_KEY, token);
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    localStorage.removeItem(loginPageConstants.AUTH_TOKEN_KEY);
    delete axios.defaults.headers.common.Authorization;
  }
};

axios.interceptors.request.use((config) => {
  const token = getStoredToken();

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    if (
      trimmedEmail.toLowerCase() === loginPageConstants.DEMO_EMAIL.toLowerCase() &&
      password === loginPageConstants.DEMO_PASSWORD
    ) {
      const demoUser = {
        id: 1,
        email: loginPageConstants.DEMO_EMAIL,
        name: "Demo User",
      };

      setAuthToken("demo-token");
      localStorage.setItem(loginPageConstants.USER_KEY, JSON.stringify(demoUser));
      navigate("/");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const baseUrl = import.meta.env.VITE_API_BASE_URL || "";
      const response = await axios.post(`${baseUrl}/api/auth/login`, {
        email: trimmedEmail,
        password,
      });

      const token =
        response.data?.token ||
        response.data?.accessToken ||
        response.data?.data?.token ||
        response.data?.data?.accessToken;

      if (!token) {
        throw new Error(
          "Authentication token not found in the server response.",
        );
      }

      setAuthToken(token);

      if (response.data?.user) {
        localStorage.setItem(loginPageConstants.USER_KEY, JSON.stringify(response.data.user));
      }

      navigate("/");
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Login failed. Please check your credentials and try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
            🏠
          </div>

          <h1 className="text-2xl font-semibold text-slate-900">
            {loginPageConstants.WELCOME_MESSAGE}
          </h1>

          <p className="mt-2 text-sm text-slate-500">{loginPageConstants.SIGN_HINT}</p>
        </div>

        <div className="space-y-4">
          <InputField
            type="email"
            placeholder="Email"
            value={email}
            onChange={setEmail}
          />
          <InputField
            type="password"
            placeholder="Password"
            value={password}
            onChange={setPassword}
          />
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <div className="mt-4 flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-slate-600">
            <input type="checkbox" className="h-4 w-4" />
            {loginPageConstants.REMEMBER}
          </label>

          <a
            href="/forgot-password"
            className="font-medium text-blue-600 hover:underline"
          >
            {loginPageConstants.FORGET}
          </a>
        </div>

        <div className="mt-6">
          <PrimaryButton
            text={isLoading ? loginPageConstants.LOADING : loginPageConstants.SIGN_IN}
            onClick={handleLogin}
          />
        </div>

        {/* Sign up */}
        <p className="mt-5 text-center text-sm text-slate-500">
          Don&apos;t have an account?{" "}
          <a
            href="/register"
            className="font-medium text-blue-600 hover:underline"
          >
            {loginPageConstants.SIGN_UP}
          </a>
        </p>

        {/* Divider */}
        <div className="my-5 flex items-center gap-4">
          <div className="h-px flex-1 bg-slate-200" />

          <span className="text-sm text-slate-400">or</span>

          <div className="h-px flex-1 bg-slate-200" />
        </div>

        {/* Google button */}
        <div className="space-y-3">
          <SocialButton
            text="Continue with Google"
            icon={<span className="font-semibold text-blue-600">G</span>}
            onClick={() => {
              console.log("Google sign in");
            }}
          />

          <SocialButton
            text="Continue with Apple"
            icon={<span className="text-lg"></span>}
            onClick={() => {
              console.log("Apple sign in");
            }}
          />
        </div>
      </div>
    </div>
  );
};
export default LoginPage;
