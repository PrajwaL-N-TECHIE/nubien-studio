const SupportSection = () => {
  const fanImages = [
    { gradient: "linear-gradient(135deg, hsl(20 60% 25%) 0%, hsl(30 40% 15%) 100%)", rotate: "-25deg", translateX: "-160px" },
    { gradient: "linear-gradient(135deg, hsl(35 70% 30%) 0%, hsl(20 50% 18%) 100%)", rotate: "-15deg", translateX: "-90px" },
    { gradient: "linear-gradient(135deg, hsl(90 50% 25%) 0%, hsl(130 30% 15%) 100%)", rotate: "-5deg", translateX: "-20px" },
    { gradient: "linear-gradient(135deg, hsl(200 60% 30%) 0%, hsl(220 40% 18%) 100%)", rotate: "5deg", translateX: "50px" },
    { gradient: "linear-gradient(135deg, hsl(30 60% 35%) 0%, hsl(20 40% 20%) 100%)", rotate: "15deg", translateX: "120px" },
    { gradient: "linear-gradient(135deg, hsl(40 60% 30%) 0%, hsl(30 40% 20%) 100%)", rotate: "25deg", translateX: "190px" },
  ];

  return (
    <section
      id="faq"
      className="py-24 px-6 relative overflow-hidden"
      style={{
        background: "radial-gradient(ellipse 80% 60% at 50% 100%, hsl(262 60% 20% / 0.5) 0%, transparent 70%)",
      }}
    >
      <div className="max-w-5xl mx-auto text-center">
        <div className="badge-pill inline-flex mb-6">
          <span className="badge-dot">
            <div className="w-2 h-2 rounded-full border border-white/60" />
          </span>
          <span style={{ color: "hsl(var(--muted-foreground))" }}>24/7 Support</span>
        </div>

        <h2 className="text-4xl md:text-6xl font-light mb-3" style={{ color: "hsl(var(--foreground))" }}>
          Here When You
        </h2>
        <h2 className="text-4xl md:text-6xl font-light mb-6" style={{ color: "hsl(var(--muted-foreground))" }}>
          Need Us Most Important.
        </h2>

        <p className="text-base max-w-md mx-auto mb-8" style={{ color: "hsl(var(--muted-foreground))" }}>
          Nubien comes with dedicated support to help you launch and maintain your site without friction.
        </p>

        <button
          className="px-8 py-4 rounded-2xl text-sm font-semibold mb-20"
          style={{ background: "hsl(var(--primary))", color: "white" }}
        >
          View About Reboot
        </button>

        {/* Fan of images */}
        <div className="relative h-48 flex items-center justify-center">
          {/* Speech bubbles */}
          <div
            className="absolute top-0 left-1/4 z-20 px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: "hsl(180 100% 50%)", color: "hsl(240 10% 5%)", transform: "rotate(-5deg)" }}
          >
            Hey, It's me!
          </div>
          <div
            className="absolute top-0 right-1/4 z-20 px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: "hsl(var(--primary))", color: "white", transform: "rotate(5deg)" }}
          >
            Problem Solved
          </div>

          {/* Fan cards */}
          <div className="relative flex items-end justify-center" style={{ height: "180px", width: "500px" }}>
            {fanImages.map((img, i) => (
              <div
                key={i}
                className="absolute rounded-2xl overflow-hidden"
                style={{
                  width: "110px",
                  height: "150px",
                  background: img.gradient,
                  transform: `rotate(${img.rotate}) translateX(${img.translateX})`,
                  transformOrigin: "bottom center",
                  border: "2px solid hsl(var(--border))",
                  bottom: 0,
                  left: "50%",
                  marginLeft: "-55px",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SupportSection;
