import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="py-8 bg-white border-t border-zinc-200">
      <div className="container px-4 sm:px-6 mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Link
            to="/"
            className="text-xl font-bold font-display tracking-tight text-zinc-950 whitespace-nowrap shrink-0"
          >
            PROHOR<span className="text-blue-600">.</span>
          </Link>

          <p className="text-sm text-zinc-500 text-center md:text-left">
            &copy; {new Date().getFullYear()} Shakibul Islam Prohor. Dhaka, Bangladesh.
          </p>

          <div className="flex items-center gap-6 text-sm font-medium text-zinc-600">
            <Link to="/my-projects" className="hover:text-zinc-950 transition-colors">
              Projects
            </Link>
            <a href="/#blog" className="hover:text-zinc-950 transition-colors">
              Articles
            </a>
            <a href="/#contact" className="hover:text-zinc-950 transition-colors">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
