import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { LucideIcon } from "lucide-react";
import {
  Bean,
  Bike,
  Coffee,
  Dumbbell,
  Heart,
  Mountain,
  Shield,
  Sparkles,
  Target,
  Trophy,
  Wind,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export type AboutHobbyFeature = {
  name: string;
  description: string;
  icon:
    | "sparkles"
    | "dumbbell"
    | "target"
    | "zap"
    | "mountain"
    | "trophy"
    | "wind"
    | "shield"
    | "bike"
    | "coffee"
    | "bean"
    | "heart";
};

export type AboutHobbySection = {
  title: string;
  image: string;
  description: string;
  features: AboutHobbyFeature[];
  reverse?: boolean;
};

const iconMap: Record<AboutHobbyFeature["icon"], LucideIcon> = {
  sparkles: Sparkles,
  dumbbell: Dumbbell,
  target: Target,
  zap: Zap,
  mountain: Mountain,
  trophy: Trophy,
  wind: Wind,
  shield: Shield,
  bike: Bike,
  coffee: Coffee,
  bean: Bean,
  heart: Heart,
};

function HobbySection({
  section,
  index,
}: {
  section: AboutHobbySection;
  index: number;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        imageRef.current,
        { opacity: 0, x: section.reverse ? 50 : -50 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none reset",
          },
        },
      );

      gsap.fromTo(
        contentRef.current,
        { opacity: 0, x: section.reverse ? -50 : 50 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none reset",
          },
        },
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [section.reverse]);

  return (
    <div
      ref={sectionRef}
      className={cn(
        "grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center py-16 lg:py-24",
        index > 0 && "border-t border-border",
      )}
    >
      <div
        ref={imageRef}
        className={cn(
          "relative rounded-2xl overflow-hidden shadow-xl border bg-card",
          section.reverse && "lg:order-2",
        )}
      >
        <img
          src={section.image}
          alt={section.title}
          className="w-full h-64 lg:h-80 object-cover"
        />
      </div>

      <div ref={contentRef} className={cn(section.reverse && "lg:order-1")}>
        <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
          {section.title}
        </h2>
        <p className="text-lg text-muted-foreground mb-8">{section.description}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {section.features.map((feature) => {
            const IconComponent = iconMap[feature.icon] ?? Sparkles;
            return (
              <div
                key={feature.name}
                className="rounded-xl border bg-card p-4 flex flex-col items-center text-center shadow-sm"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-3">
                  <IconComponent className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{feature.name}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function AboutHobby({ sections }: { sections: AboutHobbySection[] }) {
  return (
    <section className="bg-muted py-16 lg:py-24">
      <div className="container mx-auto px-4 lg:px-8">
        {sections.map((section, index) => (
          <HobbySection key={section.title} section={section} index={index} />
        ))}
      </div>
    </section>
  );
}

