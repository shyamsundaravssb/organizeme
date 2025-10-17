import Link from "next/link";
import Button from "./components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <h1 className="text-6xl md:text-9xl font-extrabold text-primary">404</h1>
      <h2 className="text-2xl md:text-4xl font-bold text-text-primary mt-4">
        Page Not Found
      </h2>
      <p className="text-lg text-text-secondary mt-4 max-w-md">
        Oops! The page you're looking for doesn't exist. It might have been
        moved or deleted.
      </p>
      <Button
        as={Link}
        href="/"
        variant="primary"
        className="mt-8 px-8 py-3 text-lg"
      >
        Go Back Home
      </Button>
    </div>
  );
}
