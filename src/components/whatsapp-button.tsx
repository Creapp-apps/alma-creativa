"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { waLink } from "@/lib/site-content";
import { useSiteContent } from "@/components/site-content-provider";

type Props = {
  label?: string;
  message?: string;
  phone?: string;
  className?: string;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "secondary";
};

export function WhatsappButton({
  label = "Escribinos por WhatsApp",
  message,
  phone,
  className,
  size = "default",
  variant = "default",
}: Props) {
  const content = useSiteContent();
  const number = phone ?? content.contact.whatsapp;

  return (
    <Button
      size={size}
      variant={variant}
      className={cn(className)}
      render={
        <Link
          href={waLink(number, message)}
          target="_blank"
          rel="noopener noreferrer"
        />
      }
    >
      <MessageCircle className="size-4" />
      {label}
    </Button>
  );
}
