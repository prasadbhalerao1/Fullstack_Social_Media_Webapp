import React from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { cn } from "@/lib/utils";

const Modal = ({ open, onOpenChange, children, className, showCloseButton = true, title = "Dialog", description = "Dialog Content" }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        showCloseButton={showCloseButton}
        className={cn("sm:max-w-[425px] bg-neutral-900 border border-white/10 text-white rounded-2xl p-6 focus:outline-none", className)}
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">{description}</DialogDescription>
        {children}
      </DialogContent>
    </Dialog>
  );
};

export default Modal;
