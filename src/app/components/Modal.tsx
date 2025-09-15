"use client";

import { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string; // <-- Add optional className prop
}

export default function Modal({
  isOpen,
  onClose,
  children,
  className = "w-full max-w-md",
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={onClose}
    >
      {/* The new className prop is used here to allow custom sizing */}
      <div
        className={`bg-white p-8 rounded-lg shadow-xl ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
