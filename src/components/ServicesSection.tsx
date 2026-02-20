import { ArrowUpRight, Cloud, MessageCircle, TrendingUp, Eye, Mic, Zap, PenLine, Lock, Layers, Database, BarChart2, User, Target, LineChart } from "lucide-react";
import serviceVision from "@/assets/service-vision.jpg";
import serviceSpeech from "@/assets/service-speech.jpg";
import serviceAutomation from "@/assets/service-automation.jpg";

const mainServices = [
  {
    icon: Cloud,
    title: "AI-Powered Development",
    subtitle: "Smart Websites",
    description: "Build intelligent web applications and digital experiences powered by cutting-edge AI.",
  },
  {
    icon: MessageCircle,
    title: "AI Chatbots",
    subtitle: "24/7 Customer Support",
    description: "Deploy smart conversational AI agents to handle customer queries around the clock.",
  },
  {
    icon: TrendingUp,
    title: "Predictive Analytics",
    subtitle: "Driven Decisions",
    description: "Harness machine learning to forecast trends and make data-driven business decisions.",
  },
];

const detailServices = [
  {
    icon: Eye,
    title: "Computer Vision Solutions",
    subtitle: "World Through AI",
    description: "AI-based facial recognition, image analysis, and automation solutions.",
    image: serviceVision,
  },
  {
    icon: Mic,
    title: "Speech Recognition",
    subtitle: "Smart Actions",
    description: "Develop voice assistants, transcriptions, and speech with AI.",
    image: serviceSpeech,
  },
  {
    icon: Zap,
    title: "AI-Driven Automation",
    subtitle: "Driven Decisions",
    description: "Automate tasks, reduce costs, and improve productivity with solutions.",
    image: serviceAutomation,
  },
];

const capabilityTags = [
  { icon: PenLine, label: "AI Content Generation" },
  { icon: Lock, label: "Cybersecurity" },
  { icon: Layers, label: "UX/UI Optimization" },
  { icon: Database, label: "Data Insight" },
  { icon: BarChart2, label: "Analytics" },
  { icon: User, label: "Personalization" },
  { icon: Target, label: "Data Analysis" },
  { icon: LineChart, label: "Lead Generation" },
];

const ServicesSection = () => {
  return (
    <section id="portfolio" className="py-24 overflow-hidden">
      {/* Services banner with purple bg */}
      <div
        className="mx-6 rounded-3xl py-20 px-6 text-center mb-12 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, hsl(240 60% 18%) 0%, hsl(262 70% 25%) 50%, hsl(240 60% 18%) 100%)",
          backgroundImage: "radial-gradient(ellipse 80% 100% at 50% -20%, hsl(262 80% 50% / 0.4) 0%, transparent 60%)",
        }}
      >
        {/* Dot pattern overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative z-10">
          <div className="badge-pill inline-flex mb-6">
            <span className="badge-dot">
              <div className="w-2 h-2 rounded-full border border-white/60" />
            </span>
            <span style={{ color: "hsl(var(--muted-foreground))" }}>Services</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-light mb-3" style={{ color: "hsl(var(--foreground))" }}>
            AI-Powered Services for
          </h2>
          <h2 className="text-4xl md:text-6xl font-light mb-6" style={{ color: "hsl(var(--muted-foreground))" }}>
            Future-Driven Businesses
          </h2>
          <p className="text-base max-w-lg mx-auto mb-8" style={{ color: "hsl(var(--muted-foreground))" }}>
            Our cutting-edge AI solutions are designed to transform businesses, enhance efficiency, and drive innovation.
          </p>
          <button
            className="px-8 py-4 rounded-2xl text-sm font-semibold transition-all duration-200"
            style={{ background: "hsl(var(--primary))", color: "white" }}
          >
            Book a 15-min call
          </button>
        </div>
      </div>

      {/* Main service cards */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {mainServices.map((service, i) => (
            <div
              key={i}
              className="card-service p-6 relative group cursor-pointer transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: "hsl(var(--primary))" }}
                >
                  <service.icon size={18} className="text-white" />
                </div>
                <ArrowUpRight
                  size={18}
                  className="opacity-40 group-hover:opacity-100 transition-opacity"
                  style={{ color: "hsl(var(--foreground))" }}
                />
              </div>
              <h3 className="text-lg font-semibold mb-1" style={{ color: "hsl(var(--foreground))" }}>
                {service.title}
              </h3>
              <p className="text-sm mb-3" style={{ color: "hsl(var(--primary))" }}>
                {service.subtitle}
              </p>
              <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
                {service.description}
              </p>
            </div>
          ))}
        </div>

        {/* Detail service cards with images */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
          {detailServices.map((service, i) => (
            <div
              key={i}
              className="card-service p-6 relative group cursor-pointer transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: "hsl(var(--primary))" }}
                >
                  <service.icon size={18} className="text-white" />
                </div>
                <ArrowUpRight
                  size={18}
                  className="opacity-40 group-hover:opacity-100 transition-opacity"
                  style={{ color: "hsl(var(--foreground))" }}
                />
              </div>
              <h3 className="text-lg font-semibold mb-1" style={{ color: "hsl(var(--foreground))" }}>
                {service.title}
              </h3>
              <p className="text-sm mb-3" style={{ color: "hsl(var(--primary))" }}>
                {service.subtitle}
              </p>
              <div className="my-2 border-t" style={{ borderColor: "hsl(var(--border))" }} />
              <p className="text-sm mb-4" style={{ color: "hsl(var(--muted-foreground))" }}>
                {service.description}
              </p>
              <div className="rounded-xl overflow-hidden" style={{ height: "140px" }}>
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Capability tags */}
        <div className="flex flex-wrap justify-center gap-3 mb-4">
          {capabilityTags.slice(0, 5).map((tag, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-5 py-3 rounded-full text-sm font-medium"
              style={{
                background: "hsl(var(--surface))",
                border: "1px solid hsl(var(--border))",
                color: "hsl(var(--foreground))",
              }}
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: "hsl(var(--primary))" }}
              >
                <tag.icon size={12} className="text-white" />
              </div>
              {tag.label}
            </div>
          ))}
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {capabilityTags.slice(5).map((tag, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-5 py-3 rounded-full text-sm font-medium"
              style={{
                background: "hsl(var(--surface))",
                border: "1px solid hsl(var(--border))",
                color: "hsl(var(--foreground))",
              }}
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: "hsl(var(--primary))" }}
              >
                <tag.icon size={12} className="text-white" />
              </div>
              {tag.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
