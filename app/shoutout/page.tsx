import { ShoutoutForm } from "@/components/shoutout-form";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function ShoutoutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Nav />

      {/* Hero Background */}
      <div className="relative flex-1">
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 30%, rgba(255, 137, 6, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 80% 70%, rgba(242, 95, 76, 0.12) 0%, transparent 50%)
            `,
          }}
        />

        <div className="relative z-10 container py-12 md:py-16">
          {/* Back Link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ChevronLeft className="h-4 w-4" />
            Volver al Inicio
          </Link>

          {/* Form */}
          <ShoutoutForm />
        </div>
      </div>

      <Footer />
    </div>
  );
}
