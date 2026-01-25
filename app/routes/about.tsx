import type { Route } from "./+types/about";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { defaultLng, supportedLngs } from "@/i18n/config";
import { AboutHero } from "@/components/about/Hero";
import { AboutHobby, type AboutHobbySection } from "@/components/about/Hobby";

type Lang = (typeof supportedLngs)[number];

const content: Record<
  Lang,
  {
    metaTitle: string;
    metaDescription: string;
    heroTitle: string;
    heroTagline: string;
    introTitle: string;
    introDescription: string;
    sections: AboutHobbySection[];
  }
> = {
  zh: {
    metaTitle: "关于 Aric",
    metaDescription: "关于 Aric：兴趣、项目与联系方式。",
    heroTitle: "WHO THE\nHELL AM I?",
    heroTagline: "TIMELESS DESIGN,\nRICH HERITAGE.",
    introTitle: "About Aric",
    introDescription:
      "这里是 AricSu（AskAric）。我喜欢做产品、写工程化的东西，也喜欢把复杂问题讲清楚。除了代码，我也投入网球、滑雪、摩托和咖啡。",
    sections: [
      {
        title: "热爱网球",
        image: "/images/hero/tennis.jpeg",
        description:
          "2016 年，大学校队开始接触网球，中间因毕业搁置了一段时间，发现网球是一项值得长期投入的运动。",
        features: [
          {
            name: "回血良药",
            description: "曾有一段状态低迷，靠着每天投入工作 + 网球，逐渐走出低谷。",
            icon: "sparkles",
          },
          {
            name: "强身健体",
            description:
              "在刚步入工作的前 3 年，每年体重增长 10 斤，重拾网球后情况有所抑制。",
            icon: "dumbbell",
          },
          {
            name: "不断精进",
            description:
              "网球是一项需要持续练习与提升的竞技运动，天花板足够高，而且不受年龄限制。",
            icon: "target",
          },
        ],
      },
      {
        title: "喜欢滑雪",
        image: "/images/hero/snowboard.png",
        description:
          "2023 年开始接触滑雪运动，喜欢在雪地上飞驰的感觉，同时也能锻炼身体协调性和平衡感。",
        reverse: true,
        features: [
          {
            name: "速度与激情",
            description: "滑雪时的速度感和自由感令人兴奋，让人短暂忘记一切烦恼。",
            icon: "zap",
          },
          {
            name: "美丽风景",
            description: "在雪地里看风景，感受大自然的宁静与壮丽。",
            icon: "mountain",
          },
          {
            name: "技巧挑战",
            description: "持续挑战自我，提升技术动作，享受进步带来的成就感。",
            icon: "trophy",
          },
        ],
      },
      {
        title: "喜欢摩托",
        image: "/images/hero/motorcycle.jpeg",
        description:
          "2022 年开始接触摩托车，喜欢在公路上驰骋的感觉，也锻炼反应能力和身体协调。",
        features: [
          {
            name: "跑山快感",
            description: "山路骑行释放压力，感受风与速度的结合。",
            icon: "wind",
          },
          {
            name: "强身健体",
            description: "骑行锻炼了反应能力和协调性，提高整体体能。",
            icon: "shield",
          },
          {
            name: "技巧提升",
            description: "不断练习与提升驾驶技巧，享受驾驶带来的乐趣。",
            icon: "bike",
          },
        ],
      },
      {
        title: "制作咖啡",
        image: "/images/hero/coffee.jpg",
        description:
          "2018 年在大学假期兼职咖啡店，学习了咖啡制作与拉花，逐渐培养了对咖啡的兴趣。",
        reverse: true,
        features: [
          {
            name: "咖啡豆风味",
            description: "了解不同产地与烘焙程度的风味特点，提升品鉴能力。",
            icon: "bean",
          },
          {
            name: "拉花技巧",
            description: "学习各种拉花技巧，提升咖啡的视觉美感与制作手感。",
            icon: "coffee",
          },
          {
            name: "手冲乐趣",
            description: "喜欢手冲过程，享受每一杯咖啡的稳定与变化。",
            icon: "heart",
          },
        ],
      },
    ],
  },
  en: {
    metaTitle: "About Aric",
    metaDescription: "About Aric: hobbies, projects, and links.",
    heroTitle: "WHO THE\nHELL AM I?",
    heroTagline: "TIMELESS DESIGN,\nRICH HERITAGE.",
    introTitle: "About Aric",
    introDescription:
      "I’m AricSu (AskAric). I build things, write engineering-heavy systems, and enjoy making complex topics easier to understand. Outside of code, I’m into tennis, snowboarding, motorcycling, and coffee.",
    sections: [
      {
        title: "Tennis",
        image: "/images/hero/tennis.jpeg",
        description:
          "I started playing tennis with my university team in 2016. After a pause, I came back and realized it’s a sport worth investing in long-term.",
        features: [
          {
            name: "Recharge",
            description:
              "There was a rough period. Work plus daily tennis helped me gradually get back on track.",
            icon: "sparkles",
          },
          {
            name: "Fitness",
            description:
              "In my first three working years, I gained weight quickly. Picking up tennis again kept it in check.",
            icon: "dumbbell",
          },
          {
            name: "Always improving",
            description:
              "Tennis is a competitive sport with a high ceiling. As a hobby, it’s also friendly to long-term practice.",
            icon: "target",
          },
        ],
      },
      {
        title: "Snowboarding",
        image: "/images/hero/snowboard.png",
        description:
          "I started snowboarding in 2023. I love the feeling of speed on snow, and it’s great for balance and coordination.",
        reverse: true,
        features: [
          {
            name: "Speed",
            description: "That mix of speed and freedom clears the mind.",
            icon: "zap",
          },
          {
            name: "Nature",
            description: "Snowy mountains are simply stunning.",
            icon: "mountain",
          },
          {
            name: "Challenge",
            description: "I enjoy pushing myself and improving technique.",
            icon: "trophy",
          },
        ],
      },
      {
        title: "Motorcycling",
        image: "/images/hero/motorcycle.jpeg",
        description:
          "I got into motorcycling in 2022. Riding on open roads is exhilarating and keeps reflexes sharp.",
        features: [
          {
            name: "Mountain rides",
            description: "Twisty roads, wind, and speed—pure release.",
            icon: "wind",
          },
          {
            name: "Stamina",
            description: "Riding trains coordination and overall physical control.",
            icon: "shield",
          },
          {
            name: "Skills",
            description: "Practicing technique is part of the fun.",
            icon: "bike",
          },
        ],
      },
      {
        title: "Coffee",
        image: "/images/hero/coffee.jpg",
        description:
          "In 2018, I worked part-time at a café and learned brewing and latte art. That’s when I fell in love with coffee.",
        reverse: true,
        features: [
          {
            name: "Beans",
            description: "Exploring origins and roasts helps me taste more clearly.",
            icon: "bean",
          },
          {
            name: "Latte art",
            description: "It’s both craft and control—very satisfying.",
            icon: "coffee",
          },
          {
            name: "Pour-over",
            description: "I enjoy the process and the subtle differences cup to cup.",
            icon: "heart",
          },
        ],
      },
    ],
  },
};

export function meta({ params }: Route.MetaArgs) {
  const lang =
    typeof params.lang === "string" &&
    supportedLngs.includes(params.lang as Lang)
      ? (params.lang as Lang)
      : defaultLng;
  const c = content[lang];
  return [
    { title: c.metaTitle },
    { name: "description", content: c.metaDescription },
  ];
}

export default function About({ params }: Route.ComponentProps) {
  const lang =
    typeof params.lang === "string" &&
    supportedLngs.includes(params.lang as Lang)
      ? (params.lang as Lang)
      : defaultLng;
  const c = content[lang];

  return (
    <>
      <Header className="hidden md:block" />
      <main className="flex-1">
        <AboutHero title={c.heroTitle} tagline={c.heroTagline} />
        <AboutHobby sections={c.sections} />
      </main>
      <Footer />
    </>
  );
}
