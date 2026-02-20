import heroOrb from "@/assets/hero-orb.jpg";

const HeroSection = () => {
  return (
    <section id="home" className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden pt-20">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute bottom-0 left-0 right-0 h-[65%]"
          style={{
            backgroundImage: `url(${heroOrb})`,
            backgroundSize: "cover",
            backgroundPosition: "center top",
            maskImage: "radial-gradient(ellipse 90% 80% at 50% 100%, black 30%, transparent 80%)",
            WebkitMaskImage: "radial-gradient(ellipse 90% 80% at 50% 100%, black 30%, transparent 80%)",
            opacity: 0.7,
          }}
        />
        {/* Floating dot */}
        <div
          className="absolute top-1/3 right-1/4 w-3 h-3 rounded-full"
          style={{ background: "hsl(var(--foreground))", opacity: 0.8 }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 flex flex-col items-center gap-6">
        {/* Badge */}
        <div className="badge-pill">
          <span className="badge-dot">
            <span className="text-xs font-bold text-white">25</span>
          </span>
          <span
            className="px-2 py-0.5 rounded-full text-xs font-bold"
            style={{ background: "hsl(var(--primary))", color: "white" }}
          >
            2025
          </span>
          <span style={{ color: "hsl(var(--muted-foreground))" }}>Next-Gen AI Studio</span>
        </div>

        {/* Headline */}
        <h1
          className="text-5xl md:text-7xl lg:text-8xl font-light leading-tight tracking-tight"
          style={{ color: "hsl(var(--foreground))" }}
        >
          AI-Driven Success
          <br />
          Redefining the Future.
        </h1>

        {/* Subtitle */}
        <p className="text-base md:text-lg max-w-md leading-relaxed" style={{ color: "hsl(var(--muted-foreground))" }}>
          Creating latest solutions that redefine innovation.
          <br />
          Stay ahead with AI-powered technology for the future.
        </p>

        {/* Buttons */}
        <div className="flex items-center gap-4 mt-2">
          <button
            className="px-7 py-3.5 rounded-xl text-sm font-semibold border transition-all duration-200"
            style={{
              border: "1px solid hsl(var(--border))",
              color: "hsl(var(--foreground))",
              background: "hsl(var(--surface) / 0.5)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "hsl(var(--surface-2))")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "hsl(var(--surface) / 0.5)")}
          >
            Connect With Us
          </button>
          <button
            className="px-7 py-3.5 rounded-xl text-sm font-semibold border transition-all duration-200"
            style={{
              border: "1px solid hsl(var(--border))",
              color: "hsl(var(--foreground))",
              background: "hsl(var(--surface) / 0.5)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "hsl(var(--surface-2))")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "hsl(var(--surface) / 0.5)")}
          >
            What is Nubien?
          </button>
        </div>
      </div>

      {/* Brand logos strip */}
      <div className="absolute bottom-8 left-0 right-0 z-10 flex items-center justify-center gap-12 opacity-30">
        {["FLUX", "OOO", "BOOO", "REI"].map((brand) => (
          <span key={brand} className="text-sm font-bold tracking-widest" style={{ color: "hsl(var(--foreground))" }}>
            {brand}
          </span>
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
