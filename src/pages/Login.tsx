import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useMutation } from "@tanstack/react-query";
import * as Yup from "yup";
import { AlertCircle, Lock, Mail, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { loginApi } from "../lib/auth-queries";
import { dataLocalStorage, saveLocalStorage } from "../helper/public-functions";
import { useAuth } from "../context/AuthContext";

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
});

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showError, setShowError] = useState(false);

  const loginMutation = useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      const userData = {
        created_date: data.admin.createdAt,
        email: data.admin.email,
        fullname: `${data.admin.firstName} ${data.admin.lastName}`,
        id: data.admin._id,
        is_active: data.admin.type.isActive ? 1 : 0,
        is_deleted: 0,
        last_login: null,
        main_img: null,
        token: data.accessToken,
        user_type_id: data.admin.type._id,
        username: data.admin.firstName,
        refreshToken: data?.refreshToken,
      };

      // Use the login function from AuthContext
      login(userData);

      // Still save privileges to localStorage
      saveLocalStorage(dataLocalStorage.privileges, data?.privileges);

      // Navigate to dashboard
      navigate("/dashboard");
    },
    onError: () => {
      setShowError(true);
    },
  });

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-stretch">
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary to-indigo-800 p-12 flex-col justify-between">
        <div>
          <h1 className="text-white text-3xl font-bold">Dashboard</h1>
        </div>
        <div className="space-y-6">
          <h2 className="text-white text-4xl font-bold leading-tight">
            Welcome back to your admin dashboard
          </h2>
          <p className="text-purple-200 text-lg">
            Securely sign in to access your account and manage your resources.
          </p>
          <div className="flex items-center space-x-2">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-white/20 border-2 border-primary/80 flex items-center justify-center text-white font-medium"
                >
                  {i}
                </div>
              ))}
            </div>
            <p className="text-purple-200">
              Join thousands of administrators using our platform
            </p>
          </div>
        </div>
        <div className="text-purple-200 text-sm">
          © {new Date().getFullYear()} Your Company. All rights reserved.
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <Card className="w-full max-w-md shadow-lg border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-black">
              Sign in
            </CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>

          {showError && (
            <div className="px-6 pb-5">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Invalid email or password. Please try again.
                </AlertDescription>
              </Alert>
            </div>
          )}

          <CardContent>
            <Formik
              initialValues={{ email: "", password: "" }}
              validationSchema={LoginSchema}
              onSubmit={(values) => {
                setShowError(false);
                loginMutation.mutate(values);
              }}
            >
              {({ errors, touched }) => (
                <Form className="space-y-4">
                  <div className="space-y-2">
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Field
                        as={Input}
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        className={`pl-10 text-black${
                          errors.email && touched.email ? "border-red-500" : ""
                        }`}
                        placeholder="Email address"
                      />
                    </div>
                    <ErrorMessage
                      name="email"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Field
                        as={Input}
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        className={`pl-10 text-black ${
                          errors.password && touched.password
                            ? "border-red-500"
                            : ""
                        }`}
                        placeholder="Password"
                      />
                    </div>
                    <ErrorMessage
                      name="password"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>

                  <div className="flex items-center justify-end w-full">
                    <div className="text-sm flex justify-end items-end">
                      <a
                        href="#"
                        className="font-medium text-primary hover:text-primary/80"
                      >
                        Forgot password?
                      </a>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loginMutation.isPending}
                    className="w-full bg-primary hover:bg-primary/80"
                  >
                    {loginMutation.isPending ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Signing in...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        Sign in <ArrowRight className="ml-2 h-4 w-4" />
                      </span>
                    )}
                  </Button>
                </Form>
              )}
            </Formik>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
