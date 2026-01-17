"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Music } from "lucide-react";
import { createClient } from "@/lib/supabase";

interface ShoutoutFormData {
  name: string;
  city: string;
  country: string;
  message: string;
  songRequest: string;
}

export function ShoutoutForm() {
  const [formData, setFormData] = useState<ShoutoutFormData>({
    name: "",
    city: "",
    country: "",
    message: "",
    songRequest: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (
      !formData.name.trim() ||
      !formData.city.trim() ||
      !formData.country.trim() ||
      !formData.message.trim()
    ) {
      alert("Por favor completa todos los campos requeridos");
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();

      const { error } = await supabase.from('shoutouts').insert({
        name: formData.name,
        city: formData.city,
        country: formData.country,
        message: formData.message,
        song_request: formData.songRequest || null,
      });

      if (error) {
        console.error("Error submitting shoutout:", error);
        alert("Hubo un error al enviar tu mensaje. Por favor intenta de nuevo.");
        return;
      }

      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting shoutout:", error);
      alert("Hubo un error al enviar tu mensaje. Por favor intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card className="max-w-2xl mx-auto bg-card/50 backdrop-blur">
        <CardContent className="p-8 md:p-12 text-center space-y-6">
          <div className="w-20 h-20 bg-brand-orange/20 rounded-full flex items-center justify-center mx-auto">
            <Heart className="h-10 w-10 text-brand-orange fill-brand-orange" />
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-bold">¡Gracias!</h2>
            <p className="text-lg text-muted-foreground">
              Tu mensaje ha sido enviado correctamente
            </p>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Tu saludo será revisado y publicado próximamente en nuestra
              estación. ¡Gracias por ser parte de la familia salsera!
            </p>
          </div>
          <Button
            size="lg"
            onClick={() => {
              setSubmitted(false);
              setFormData({
                name: "",
                city: "",
                country: "",
                message: "",
                songRequest: "",
              });
            }}
            className="bg-brand-orange hover:bg-brand-orange/90 text-white"
          >
            Enviar Otro Saludo
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto bg-card/50 backdrop-blur">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-3xl font-bold mb-2">
          Deja Tu Saludo
        </CardTitle>
        <p className="text-muted-foreground">
          Comparte tu mensaje con la comunidad salsera
        </p>
      </CardHeader>
      <CardContent className="p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-base">
              Nombre <span className="text-brand-coral">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Tu nombre completo"
              value={formData.name}
              onChange={handleChange}
              required
              className="h-12 text-base"
              maxLength={100}
            />
          </div>

          {/* Location */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city" className="text-base">
                Ciudad <span className="text-brand-coral">*</span>
              </Label>
              <Input
                id="city"
                name="city"
                type="text"
                placeholder="Tu ciudad"
                value={formData.city}
                onChange={handleChange}
                required
                className="h-12 text-base"
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country" className="text-base">
                País <span className="text-brand-coral">*</span>
              </Label>
              <Input
                id="country"
                name="country"
                type="text"
                placeholder="Tu país"
                value={formData.country}
                onChange={handleChange}
                required
                className="h-12 text-base"
                maxLength={100}
              />
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message" className="text-base">
              Mensaje / Dedicatoria <span className="text-brand-coral">*</span>
            </Label>
            <Textarea
              id="message"
              name="message"
              placeholder="Escribe tu mensaje o dedicatoria..."
              value={formData.message}
              onChange={handleChange}
              required
              className="min-h-[120px] text-base resize-none"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {formData.message.length}/500
            </p>
          </div>

          {/* Song Request */}
          <div className="space-y-2">
            <Label htmlFor="songRequest" className="text-base flex items-center gap-2">
              <Music className="h-4 w-4 text-brand-orange" />
              Canción que te gustaría escuchar (opcional)
            </Label>
            <Input
              id="songRequest"
              name="songRequest"
              type="text"
              placeholder="Ej: El Cantante - Héctor Lavoe"
              value={formData.songRequest}
              onChange={handleChange}
              className="h-12 text-base"
              maxLength={200}
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white text-lg h-14"
          >
            {isSubmitting ? "Enviando..." : "Enviar Saludo"}
          </Button>

          {/* Note */}
          <p className="text-xs text-muted-foreground text-center">
            Tu saludo será revisado antes de ser publicado. Los mensajes
            aprobados aparecerán en nuestra página principal.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
