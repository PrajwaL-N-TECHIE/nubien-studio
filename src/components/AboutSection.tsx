const AboutSection = () => {
  return (
    <section
      id="about"
      className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden py-32"
    >
      {/* Purple glow top */}
      <div
        className="absolute top-0 left-0 right-0 h-64 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 100% 60% at 50% 0%, hsl(262 83% 40% / 0.5) 0%, transparent 80%)",
        }}
      />

      {/* Floating dot */}
      <div
        className="absolute bottom-1/3 right-1/4 w-3 h-3 rounded-full"
        style={{ background: "hsl(var(--foreground))", opacity: 0.6 }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 flex flex-col items-center gap-8">
        {/* Badge */}
        <div className="badge-pill">
          <span className="badge-dot">
            <div className="w-2 h-2 rounded-full border border-white/60" />
          </span>
          <span style={{ color: "hsl(var(--muted-foreground))" }}>About Us</span>
        </div>

        {/* Headline with mixed opacity */}
        <h2 className="text-4xl md:text-6xl lg:text-7xl font-light leading-tight tracking-tight">
          <span style={{ color: "hsl(var(--foreground))" }}>
            Built on creativity, collaboration, and top excellence, SYNC is a dynamic team{" "}
          </span>
          <span style={{ color: "hsl(var(--muted-foreground))" }}>
            of industry experts committed to achieving exceptional great results...
          </span>
        </h2>

        {/* CTA */}
        <button
          className="mt-4 px-8 py-4 rounded-2xl text-sm font-semibold transition-all duration-200"
          style={{
            background: "hsl(var(--primary))",
            color: "hsl(var(--primary-foreground))",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.1)")}
          onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
        >
          Book an Appointment
        </button>
      </div>
    </section>
  );
};

export default AboutSection;
