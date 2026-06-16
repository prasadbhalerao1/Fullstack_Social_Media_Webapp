import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "../lib/utils";

const Modal = ({
  openModal,
  onClose,
  children,
  initialWidth = "max-w-md",
  initialHeight = "h-[85vh]",
  showCloseButton = true,
  className,
}) => {
  const [show, setShow] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (openModal) {
      setMounted(true);
      const timer = setTimeout(() => setShow(true), 10);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
      const timeout = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [openModal]);

  useEffect(() => {
    if (mounted) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 cursor-pointer ${
          show ? "opacity-100" : "opacity-0"
        }`}
      />
      
      {/* Close Button */}
      {showCloseButton && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 text-neutral-400 hover:text-white hover:scale-110 transition duration-200 cursor-pointer p-1 bg-neutral-900/50 hover:bg-neutral-900 rounded-full border border-white/5"
        >
          <X size={24} />
        </button>
      )}
      
      {/* Modal Box */}
      <div
        className={cn(
          "relative flex flex-col bg-neutral-950/95 border border-white/10 rounded-2xl shadow-2xl overflow-hidden w-[90%] transform transition-all duration-300 z-10",
          initialWidth,
          initialHeight,
          show
            ? "opacity-100 translate-y-0 scale-100 ease-out"
            : "opacity-0 translate-y-8 scale-95 ease-in",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;
