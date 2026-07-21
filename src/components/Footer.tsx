export default function Footer() {
  return (
    <footer className="py-8 border-t border-white/10 relative z-10">
      <div className="container px-6 mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-2xl font-bold font-display tracking-tighter">
            PROHOR<span className="text-purple-500">.</span>
          </div>
          
          <p className="text-sm text-white/50 text-center md:text-left">
            &copy; {new Date().getFullYear()} Shakibul Islam Prohor. All rights reserved.
          </p>
          
          <div className="flex items-center gap-6 text-sm font-medium text-white/50">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
