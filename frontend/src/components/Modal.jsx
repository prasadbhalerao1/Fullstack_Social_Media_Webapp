import React from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";

const Modal = ({ open, onOpenChange, children, title = "Dialog", description = "Dialog Content" }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-neutral-900 border border-white/10 text-white rounded-2xl p-6 focus:outline-none">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">{description}</DialogDescription>
        <div className="grid gap-4">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Modal;
