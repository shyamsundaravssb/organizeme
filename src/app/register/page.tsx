"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "../components/ui/Button";
import Link from "next/link";
import Card from "../components/ui/Card";

export default function Register() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Client-side Validation
    if (!name || !username || !email || !password) {
      setError("All fields are required.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    const usernameRegex = /^[a-z0-9_.]+$/;
    const sanitizedUsername = username.toLowerCase();
    if (
      sanitizedUsername.length < 3 ||
      sanitizedUsername.length > 20 ||
      !usernameRegex.test(sanitizedUsername)
    ) {
      setError(
        "Username must be 3-20 characters long and contain only letters, numbers, underscores, or periods."
      );
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          username: sanitizedUsername,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        // Redirect to the OTP verification page with the user's email as a query parameter
        router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text-primary">
            Create an Account
          </h1>
          <p className="text-text-secondary mt-2">
            Join OrganizeMe to start organizing.
          </p>
        </div>

        {/* --- REFACTORED: Replaced <div> with <Card> component --- */}
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <p className="text-center text-sm text-error">{error}</p>}
            {success && (
              <p className="text-center text-sm text-success">{success}</p>
            )}

            {/* Form Fields are already using theme styles */}
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-semibold text-text-secondary"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-sm font-semibold text-text-secondary"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-text-secondary"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-text-secondary"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Registering..." : "Create Account"}
            </Button>
          </form>
        </Card>

        <p className="mt-8 text-center text-sm text-text-secondary">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-primary hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
