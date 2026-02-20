import { useState } from "react";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = ["Home", "About", "Portfolio", "Contact", "FAQ"];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4" style={{ background: "hsl(0 0% 4% / 0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid hsl(240 6% 15% / 0.5)" }}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "hsl(var(--primary))" }}>
            <div className="w-4 h-4 rounded-full border-2 border-white/60 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
          </div>
          <span className="text-lg font-semibold text-foreground">Nubien</span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="text-sm font-medium transition-colors"
              style={{ color: "hsl(var(--muted-foreground))" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "hsl(var(--foreground))")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "hsl(var(--muted-foreground))")}
            >
              {link}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:block">
          <button
            className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
            style={{
              background: "hsl(var(--primary))",
              color: "hsl(var(--primary-foreground))",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "hsl(var(--purple-dark))")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "hsl(var(--primary))")}
          >
            Get In Touch
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-foreground" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden mt-4 pb-4 border-t" style={{ borderColor: "hsl(var(--border))" }}>
          <div className="flex flex-col gap-4 pt-4">
            {navLinks.map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className="text-sm font-medium px-2"
                style={{ color: "hsl(var(--muted-foreground))" }}
                onClick={() => setIsOpen(false)}
              >
                {link}
              </a>
            ))}
            <button
              className="mx-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
            >
              Get In Touch
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
