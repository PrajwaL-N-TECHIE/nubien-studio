const Footer = () => {
  const links = {
    Company: ["About Us", "Portfolio", "Services", "Contact"],
    Support: ["FAQ", "Documentation", "Status", "Privacy Policy"],
    Social: ["Twitter", "LinkedIn", "GitHub", "Dribbble"],
  };

  return (
    <footer
      className="py-16 px-6 border-t"
      style={{ borderColor: "hsl(var(--border))" }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: "hsl(var(--primary))" }}
              >
                <div className="w-4 h-4 rounded-full border-2 border-white/60 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
              </div>
              <span className="text-lg font-semibold" style={{ color: "hsl(var(--foreground))" }}>
                Nubien
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "hsl(var(--muted-foreground))" }}>
              Next-Gen AI Studio building the future of intelligent digital experiences.
            </p>
          </div>

          {/* Links */}
          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <h4 className="text-sm font-semibold mb-4" style={{ color: "hsl(var(--foreground))" }}>
                {section}
              </h4>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm transition-colors"
                      style={{ color: "hsl(var(--muted-foreground))" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "hsl(var(--foreground))")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "hsl(var(--muted-foreground))")}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ borderColor: "hsl(var(--border))" }}
        >
          <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
            © 2025 Nubien. All rights reserved.
          </p>
          <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
            Built with ❤️ for the future.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
