import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Sparkles,
  Dumbbell,
  Target,
  Zap,
  Mountain,
  Trophy,
  Wind,
  Shield,
  Bike,
  Coffee,
  Bean,
  Heart,
} from "lucide-react";
import { cn } from "~/lib/utils";

// 注册 GSAP 插件
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// 图标映射
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
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

interface Feature {
  name: string;
  description: string;
  icon: keyof typeof iconMap;
}

interface Section {
  title: string;
  image: string;
  description: string;
  features: Feature[];
  reverse?: boolean;
}

const sections: Section[] = [
  {
    title: "热爱网球",
    image: "/images/hero/tennis.jpeg",
    description:
      "2016 年，大学校队开始接触网球，中间因毕业搁置了一段时间，发现网球是一项值得长期投入的运动。",
    features: [
      {
        name: "回血良药",
        description: "曾有一段状态低迷，靠着每天投入工作🧑‍💼 + 网球🎾，逐渐走出低谷。",
        icon: "sparkles",
      },
      {
        name: "强身健体",
        description: "在刚步入工作的前 3 年，每年体重增长 10 斤，重拾网球是情况有所抑制。",
        icon: "dumbbell",
      },
      {
        name: "不断精进",
        description:
          "网球🎾是一项需要不断练习和提升的「竞技」运动，天花板足够高，而且作为业余爱好者不受年龄限制。",
        icon: "target",
      },
    ],
  },
  {
    title: "喜欢滑雪",
    image: "/images/hero/snowboard.png",
    description:
      "2023 年开始接触滑雪运动，喜欢在雪地上飞驰的感觉，同时滑雪也能锻炼身体协调性和平衡感。",
    reverse: true,
    features: [
      {
        name: "速度与激情",
        description: "滑雪时的速度感和自由感令人兴奋，让人忘记一切烦恼。",
        icon: "zap",
      },
      {
        name: "美丽的风景",
        description: "喜欢在雪地上欣赏美丽的自然风光，感受大自然的宁静与壮丽。",
        icon: "mountain",
      },
      {
        name: "技巧与挑战",
        description: "喜欢挑战自我，不断提升滑雪技巧，享受运动带来的成就感。",
        icon: "trophy",
      },
    ],
  },
  {
    title: "喜欢摩托",
    image: "/images/hero/motorcycle.jpeg",
    description:
      "2022 年开始接触摩托车，喜欢在公路上驰骋的感觉，同时摩托车也能锻炼身体的反应能力和协调性。",
    features: [
      {
        name: "跑山快感",
        description: "喜欢在山路上飞驰的感觉，感受风与速度的结合，释放压力。",
        icon: "wind",
      },
      {
        name: "强身健体",
        description: "摩托车骑行锻炼了身体的反应能力和协调性，提高了整体体能。",
        icon: "shield",
      },
      {
        name: "技巧提升",
        description: "不断练习和提升摩托车驾驶技巧，享受驾驶带来的乐趣和成就感。",
        icon: "bike",
      },
    ],
  },
  {
    title: "制作咖啡",
    image: "/images/hero/coffee.jpg",
    description:
      "2018 年在大学假期，在一家咖啡店兼职，学习了咖啡的制作过程和拉花技巧，逐渐培养了对咖啡的兴趣。",
    reverse: true,
    features: [
      {
        name: "咖啡豆风味",
        description: "了解不同产地和烘焙程度的咖啡豆风味特点，提升品鉴能力。",
        icon: "bean",
      },
      {
        name: "拉花技巧",
        description: "学习了各种拉花技巧，提升了咖啡的视觉美感和制作水平。",
        icon: "coffee",
      },
      {
        name: "手冲乐趣",
        description: "喜欢手冲咖啡的过程，享受每一杯咖啡带来的独特风味和满足感。",
        icon: "heart",
      },
    ],
  },
];


function HobbySection({ section, index }: { section: Section; index: number }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 图片动画
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
        }
      );

      // 内容动画
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
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [section.reverse]);

  return (
    <div
      ref={sectionRef}
      className={cn(
        "grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center py-16 lg:py-24",
        index > 0 && "border-t border-border"
      )}
    >
      {/* 图片 */}
      <div
        ref={imageRef}
        className={cn(
          "relative rounded-2xl overflow-hidden shadow-xl border bg-card",
          section.reverse && "lg:order-2"
        )}
      >
        <img
          src={section.image}
          alt={section.title}
          className="w-full h-64 lg:h-80 object-cover"
        />
      </div>

      {/* 内容 */}
      <div
        ref={contentRef}
        className={cn(section.reverse && "lg:order-1")}
      >
        <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
          {section.title}
        </h2>
        <p className="text-lg text-muted-foreground mb-8">{section.description}</p>

        {/* 特性列表 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {section.features.map((feature, idx) => {
            const IconComponent = iconMap[feature.icon] || Sparkles;
            return (
              <div
                key={idx}
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

export function Hobby() {
  return (
    <section className="bg-muted py-16 lg:py-24">
      <div className="container mx-auto px-4 lg:px-8">
        {sections.map((section, index) => (
          <HobbySection key={index} section={section} index={index} />
        ))}
      </div>
    </section>
  );
}
