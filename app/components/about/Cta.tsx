import { useEffect, useRef } from "react";
import { Link } from "react-router";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from "split-type";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function AboutCta({
  title,
  description,
  buttonText,
  href,
}: {
  title: string;
  description: string;
  buttonText: string;
  href: string;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const btnRef = useRef<HTMLAnchorElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);
  const bgImgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    let splitTitle: SplitType | null = null;
    let splitDesc: SplitType | null = null;

    const ctx = gsap.context(() => {
      if (bgImgRef.current) {
        gsap.fromTo(
          bgImgRef.current,
          { opacity: 0, y: "-10%" },
          {
            opacity: 1,
            y: "30%",
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      }

      if (imgRef.current) {
        gsap.fromTo(
          imgRef.current,
          { opacity: 0, filter: "blur(20px)", y: 40 },
          {
            opacity: 1,
            filter: "blur(0px)",
            y: 0,
            duration: 1,
            scrollTrigger: {
              trigger: imgRef.current,
              start: "top 80%",
              toggleActions: "play none none reset",
            },
          },
        );
      }

      if (titleRef.current) {
        splitTitle = new SplitType(titleRef.current, {
          types: "chars",
          tagName: "span",
        });
        gsap
          .timeline({
            scrollTrigger: {
              trigger: titleRef.current,
              start: "top 85%",
              toggleActions: "play none none reset",
            },
          })
          .from(titleRef.current.querySelectorAll(".char"), {
            yPercent: 30,
            opacity: 0,
            filter: "blur(20px)",
            duration: 1.1,
            ease: "power2.out",
            stagger: { amount: 0.7 },
          });
      }

      if (descRef.current) {
        splitDesc = new SplitType(descRef.current, {
          types: "words",
          tagName: "span",
        });
        gsap
          .timeline({
            scrollTrigger: {
              trigger: descRef.current,
              start: "top 90%",
              toggleActions: "play none none reset",
            },
          })
          .from(descRef.current.querySelectorAll(".word"), {
            yPercent: 100,
            filter: "blur(10px)",
            opacity: 0,
            duration: 0.7,
            ease: "power3.out",
            stagger: { each: 0.02 },
          });
      }

      if (btnRef.current) {
        gsap.from(btnRef.current, {
          opacity: 0,
          y: 40,
          filter: "blur(10px)",
          duration: 0.7,
          ease: "power3.out",
        });
      }
    }, sectionRef);

    return () => {
      if (splitTitle) splitTitle.revert();
      if (splitDesc) splitDesc.revert();
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen flex items-center justify-end bg-black overflow-hidden"
    >
      <div
        ref={imgRef}
        className="absolute left-0 bottom-0 m-4 md:m-8 w-56 md:w-80 rounded-lg overflow-hidden shadow-xl z-10"
      >
        <img
          src="/images/hero/cta/tihc-extension-page-small.png"
          alt="cta product"
          className="object-cover w-full h-full"
        />
      </div>

      <div className="relative z-10 flex flex-col items-end w-full max-w-2xl pr-4 md:pr-12">
        <h2
          ref={titleRef}
          className="font-serif text-white text-4xl md:text-6xl leading-tight font-normal text-right mb-8"
          style={{ letterSpacing: "-0.02em", whiteSpace: "pre-line" }}
        >
          {title}
        </h2>
        <p
          ref={descRef}
          className="font-mono text-gray-200 text-base md:text-lg text-right mb-12 max-w-xl tracking-wide"
        >
          {description}
        </p>
        <Link
          ref={btnRef}
          to={href}
          className="px-8 md:px-12 py-3 rounded-full bg-[#cbb89d] text-black font-mono text-base md:text-lg font-normal shadow-lg tracking-widest transition hover:bg-[#b8a47d]"
          data-analytics-event="cta_clicked"
          data-analytics-location="about_cta"
        >
          {buttonText}
        </Link>
      </div>
    </section>
  );
}
