"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "../components/ui/Button";
import Link from "next/link";
import Card from "../components/ui/Card";

export default function VerifyOtp() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !otp) {
      setError("Email or OTP is missing.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        router.push("/login");
      } else {
        setError(data.message || "OTP verification failed");
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
            Verify Your Email
          </h1>
          <p className="text-text-secondary mt-2">
            An OTP has been sent to your email:{" "}
            <span className="font-semibold text-text-primary">{email}</span>
          </p>
        </div>

        {/* --- REFACTORED: Replaced <div> with <Card> component --- */}
        <Card className="p-8 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <p className="text-center text-sm text-error">{error}</p>}
            {success && (
              <p className="text-center text-sm text-success">{success}</p>
            )}

            <div>
              <label
                htmlFor="otp"
                className="mb-2 block text-center text-sm font-semibold text-text-secondary"
              >
                Enter 6-Digit OTP
              </label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                maxLength={6}
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-center text-2xl tracking-[0.5em] text-text-primary focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Verifying..." : "Verify Email"}
            </Button>
          </form>
        </Card>

        <p className="mt-8 text-center text-sm text-text-secondary">
          Didn't receive the email?{" "}
          <Link
            href="/resend-otp"
            className="font-semibold text-primary hover:underline"
          >
            Resend OTP
          </Link>
        </p>
      </div>
    </div>
  );
}
