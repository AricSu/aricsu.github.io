import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "~/lib/utils";

// 注册 GSAP 插件
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 统一调节动画速度（秒）
    const animationDuration = 3.2;
    const syncDelay = animationDuration * 0.09;

    const ctx = gsap.context(() => {
      // 入场动画时间线
      const tl = gsap.timeline();

      tl.fromTo(
        titleRef.current,
        { y: 80, opacity: 0, filter: "blur(20px)" },
        { y: 0, opacity: 1, filter: "blur(0px)", duration: animationDuration, ease: "expo.out" }
      );

      tl.fromTo(
        subRef.current,
        { y: 60, opacity: 0, filter: "blur(20px)" },
        { y: 0, opacity: 1, filter: "blur(0px)", duration: animationDuration, ease: "expo.out" },
        `<+${syncDelay}`
      );

      tl.fromTo(
        imgRef.current,
        { y: 60, opacity: 0, filter: "blur(20px)" },
        { y: 0, opacity: 1, filter: "blur(0px)", duration: animationDuration, ease: "expo.out" },
        `<+${syncDelay}`
      );

      // 遮罩渐隐与内容淡入完全同步
      tl.to(maskRef.current, { opacity: 0, duration: animationDuration, ease: "expo.out" }, "<");

      // 入场动画结束后再启用滚动动画
      tl.call(() => {
        // 标题滚动动画
        gsap.fromTo(
          titleRef.current,
          { y: 0, opacity: 1, filter: "blur(0px)" },
          {
            y: -80,
            opacity: 0,
            filter: "blur(20px)",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top top",
              end: "bottom top",
              scrub: true,
            },
            ease: "power1.out",
          }
        );

        // 副标题滚动动画
        gsap.fromTo(
          subRef.current,
          { y: 0, opacity: 1, filter: "blur(0px)" },
          {
            y: -60,
            opacity: 0,
            filter: "blur(20px)",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top top",
              end: "bottom top",
              scrub: true,
            },
            ease: "power1.out",
          }
        );

        // 图片滚动动画
        gsap.fromTo(
          imgRef.current,
          { y: 0, opacity: 1, filter: "blur(0px)" },
          {
            y: "20vh",
            opacity: 0,
            filter: "blur(20px)",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top top",
              end: "bottom top",
              scrub: true,
            },
            ease: "power1.out",
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="home"
      className="relative min-h-screen bg-black text-white overflow-hidden"
    >
      {/* Google Fonts */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Roboto+Mono:wght@400;700&display=swap"
      />

      <div className="hero-contain relative h-screen px-10 pt-20 pb-10 lg:px-10 md:px-5 sm:px-4">
        {/* 主标题 */}
        <div className="absolute left-0 bottom-[120px] z-20 px-[2vw] pb-[2vw] select-none pointer-events-none">
          <h1
            ref={titleRef}
            className="m-0 p-0 font-normal text-white uppercase"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(6rem, 13vw, 12rem)",
              lineHeight: 0.85,
              letterSpacing: "-0.04em",
              fontWeight: 400,
              textShadow: "0 2px 8px rgba(0,0,0,0.12)",
              opacity: 0,
              filter: "blur(20px)",
              transform: "translateY(80px)",
            }}
          >
            &nbsp;&nbsp;WHO THE
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;HELL AM I?
          </h1>
        </div>

        {/* 副标题 */}
        <div className="absolute right-0 bottom-0 z-20 px-[2vw] pb-[2vw] text-right select-none pointer-events-none">
          <div
            ref={subRef}
            style={{
              fontFamily: "'Roboto Mono', 'Menlo', 'Monaco', 'Consolas', monospace",
              fontSize: "1rem",
              letterSpacing: "0.25em",
              color: "rgba(255,255,255,0.85)",
              textTransform: "uppercase",
              lineHeight: 1.4,
              fontWeight: 400,
              textShadow: "0 2px 8px rgba(0,0,0,0.12)",
              opacity: 0,
              filter: "blur(20px)",
              transform: "translateY(60px)",
            }}
          >
            TIMELESS DESIGN,
            <br />
            RICH HERITAGE.
          </div>
        </div>

        {/* Hero 图片 */}
        <div
          className={cn(
            "hero-img absolute inset-y-0 right-0 z-10 py-[120px]",
            "w-[45vh] h-full mr-[8vw]",
            "sm:left-1/2 sm:-translate-x-1/2 sm:right-auto sm:mr-0",
            "md:right-0 md:translate-x-0 md:left-auto md:mr-[8vw]"
          )}
          style={{ aspectRatio: "100/110" }}
        >
          <img
            ref={imgRef}
            src="/images/hero/hero.jpg"
            loading="eager"
            alt="Hero Image"
            className="w-full h-full object-cover object-center"
            style={{
              opacity: 0,
              filter: "blur(20px)",
              transform: "translateY(60px)",
            }}
          />
          {/* 图片遮罩 */}
          <div
            ref={maskRef}
            className="img-mask pointer-events-none absolute inset-0 bg-black z-[2]"
            style={{ opacity: 1 }}
          />
        </div>
      </div>
    </section>
  );
}
