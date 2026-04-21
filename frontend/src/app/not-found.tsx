export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="font-display font-black text-6xl sm:text-8xl text-[#1F3D2B] tracking-tighter">404</h1>
        <p className="mt-4 font-bold uppercase tracking-widest text-[#B8431A]">Page not found</p>
        <p className="mt-2 text-sm text-[#1F3D2B]/70">The page you&apos;re looking for doesn&apos;t exist.</p>
        <a href="/" className="mt-6 inline-block bg-[#1F3D2B] text-[#F5F1E8] border-[3px] border-[#1F3D2B] px-6 py-3 font-black uppercase tracking-widest text-sm hover:bg-[#B8431A] hover:border-[#B8431A] transition-colors">
          Go Home →
        </a>
      </div>
    </div>
  );
}
