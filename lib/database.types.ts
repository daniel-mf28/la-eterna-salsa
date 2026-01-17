export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      chat_messages: {
        Row: {
          id: string
          username: string
          message: string
          sticker_url: string | null
          gif_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          username: string
          message: string
          sticker_url?: string | null
          gif_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          message?: string
          sticker_url?: string | null
          gif_url?: string | null
          created_at?: string
        }
      }
      shoutouts: {
        Row: {
          id: string
          name: string
          message: string
          city: string | null
          country: string | null
          song_request: string | null
          approved: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          message: string
          city?: string | null
          country?: string | null
          song_request?: string | null
          approved?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          message?: string
          city?: string | null
          country?: string | null
          song_request?: string | null
          approved?: boolean
          created_at?: string
        }
      }
      stickers: {
        Row: {
          id: string
          name: string
          image_url: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          image_url: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          image_url?: string
          created_at?: string
        }
      }
      site_config: {
        Row: {
          id: string
          key: string
          value: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: string
          updated_at?: string
        }
      }
      djs: {
        Row: {
          id: string
          name: string
          photo_url: string | null
          schedule: string | null
          bio: string | null
          social_links: Json | null
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          photo_url?: string | null
          schedule?: string | null
          bio?: string | null
          social_links?: Json | null
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          photo_url?: string | null
          schedule?: string | null
          bio?: string | null
          social_links?: Json | null
          display_order?: number
          created_at?: string
        }
      }
      faqs: {
        Row: {
          id: string
          question: string
          answer: string
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          question: string
          answer: string
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          question?: string
          answer?: string
          display_order?: number
          created_at?: string
        }
      }
      platform_links: {
        Row: {
          id: string
          name: string
          icon: string
          url: string
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          icon: string
          url: string
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          icon?: string
          url?: string
          display_order?: number
          created_at?: string
        }
      }
      social_links: {
        Row: {
          id: string
          platform: string
          url: string
          created_at: string
        }
        Insert: {
          id?: string
          platform: string
          url: string
          created_at?: string
        }
        Update: {
          id?: string
          platform?: string
          url?: string
          created_at?: string
        }
      }
      admin_emails: {
        Row: {
          id: string
          email: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
