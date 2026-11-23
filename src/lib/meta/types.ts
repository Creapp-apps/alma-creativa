export const CHANNELS = ["instagram", "messenger", "whatsapp"] as const;
export type Channel = (typeof CHANNELS)[number];

export const CHANNEL_LABEL: Record<Channel, string> = {
  instagram: "Instagram",
  messenger: "Messenger",
  whatsapp: "WhatsApp",
};

// source que se guarda en `leads` cuando una conversación se califica como lead.
export const CHANNEL_SOURCE: Record<Channel, string> = {
  instagram: "instagram",
  messenger: "messenger",
  whatsapp: "whatsapp",
};
