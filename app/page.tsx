import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 text-white">
      <Navbar />
      <main className="flex flex-col items-center justify-center flex-1 px-20 text-center py-16">
        <h1 className="text-6xl font-extrabold leading-tight">
          Welcome to <span className="text-yellow-300">AlxPolly!</span>
        </h1>

        <p className="mt-5 text-2xl font-light">
          Create, share, and vote on polls effortlessly.
        </p>

        <div className="flex flex-col items-center justify-center max-w-4xl mt-12 space-y-6">
          <Link
            href="/polls"
            className="block w-full max-w-md px-8 py-4 text-center text-xl font-semibold rounded-full bg-white text-blue-600 hover:bg-gray-100 transition-colors shadow-lg"
          >
            View All Polls &rarr;
          </Link>

          <Link
            href="/create-poll"
            className="block w-full max-w-md px-8 py-4 text-center text-xl font-semibold rounded-full bg-yellow-300 text-purple-800 hover:bg-yellow-400 transition-colors shadow-lg"
          >
            Create a New Poll &rarr;
          </Link>
        </div>

        <p className="mt-10 text-lg">
          Join the community! <Link href="/signup" className="underline hover:text-yellow-300">Sign up</Link> or <Link href="/login" className="underline hover:text-yellow-300">Log in</Link>.
        </p>
      </main>
    </div>
  );
}