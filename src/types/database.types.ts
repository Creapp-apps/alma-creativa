// Tipos de la base. Mantener en sync con supabase/migrations.
// TODO(cuando haya proyecto): regenerar con
//   npm run db:types   (ver package.json; requiere SUPABASE_PROJECT_ID)

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          slug: string;
          name: string;
          short: string;
          icon: string;
          tint: string;
          sort_order: number;
          image_url: string | null;
          focal: string;
          created_at: string;
        };
        Insert: {
          slug: string;
          name: string;
          short?: string;
          icon?: string;
          tint?: string;
          sort_order?: number;
          image_url?: string | null;
          focal?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
        Relationships: [];
      };
      events: {
        Row: {
          slug: string;
          name: string;
          blurb: string;
          sort_order: number;
          image_url: string | null;
          focal: string;
          created_at: string;
        };
        Insert: {
          slug: string;
          name: string;
          blurb?: string;
          sort_order?: number;
          image_url?: string | null;
          focal?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["events"]["Insert"]>;
        Relationships: [];
      };
      products: {
        Row: {
          slug: string;
          name: string;
          category_slug: string;
          blurb: string;
          details: string[];
          price_note: string;
          price_from: number;
          featured: boolean;
          active: boolean;
          sort_order: number;
          image_url: string | null;
          focal: string;
          created_at: string;
        };
        Insert: {
          slug: string;
          name: string;
          category_slug: string;
          blurb?: string;
          details?: string[];
          price_note?: string;
          price_from?: number;
          featured?: boolean;
          active?: boolean;
          sort_order?: number;
          image_url?: string | null;
          focal?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
        Relationships: [];
      };
      product_events: {
        Row: { product_slug: string; event_slug: string };
        Insert: { product_slug: string; event_slug: string };
        Update: Partial<{ product_slug: string; event_slug: string }>;
        Relationships: [];
      };
      leads: {
        Row: {
          id: string;
          name: string;
          phone: string;
          email: string | null;
          event_slug: string | null;
          event_date: string | null;
          guests: number | null;
          comments: string | null;
          notes: string | null;
          source: string;
          status: string;
          production_stage: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          phone: string;
          email?: string | null;
          event_slug?: string | null;
          event_date?: string | null;
          guests?: number | null;
          comments?: string | null;
          notes?: string | null;
          source?: string;
          status?: string;
          production_stage?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["leads"]["Insert"]>;
        Relationships: [];
      };
      lead_items: {
        Row: {
          id: string;
          lead_id: string;
          product_slug: string | null;
          product_name: string;
          qty: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          lead_id: string;
          product_slug?: string | null;
          product_name: string;
          qty?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["lead_items"]["Insert"]>;
        Relationships: [];
      };
      conversations: {
        Row: {
          id: string;
          channel: string;
          external_id: string;
          contact_name: string | null;
          contact_handle: string | null;
          last_message_at: string | null;
          last_message_preview: string | null;
          last_inbound_at: string | null;
          unread: number;
          lead_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          channel: string;
          external_id: string;
          contact_name?: string | null;
          contact_handle?: string | null;
          last_message_at?: string | null;
          last_message_preview?: string | null;
          last_inbound_at?: string | null;
          unread?: number;
          lead_id?: string | null;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["conversations"]["Insert"]
        >;
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          direction: string;
          external_id: string | null;
          text: string | null;
          media_url: string | null;
          media_type: string | null;
          status: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          direction: string;
          external_id?: string | null;
          text?: string | null;
          media_url?: string | null;
          media_type?: string | null;
          status?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["messages"]["Insert"]>;
        Relationships: [];
      };
      site_content: {
        Row: { id: string; content: unknown; updated_at: string };
        Insert: { id?: string; content?: unknown; updated_at?: string };
        Update: { id?: string; content?: unknown; updated_at?: string };
        Relationships: [];
      };
      business_settings: {
        Row: { id: string; data: unknown; updated_at: string };
        Insert: { id?: string; data?: unknown; updated_at?: string };
        Update: { id?: string; data?: unknown; updated_at?: string };
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};
