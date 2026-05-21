import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-center"
      style={{ zIndex: 999999 }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-purple-900/90 backdrop-blur-xl group-[.toaster]:text-white group-[.toaster]:border-purple-500/50 group-[.toaster]:shadow-[0_0_50px_rgba(168,85,247,0.5)] rounded-2xl px-6 py-4 font-bold text-base",
          description: "group-[.toast]:text-purple-200 font-medium text-sm mt-1",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
