import { Hero } from "~/components/Landing/Hero";
import { Cta } from "~/components/Landing/Cta";
import { Hobby } from "~/components/Landing/Hobby";

export default function Home() {
  return (
    <>
      <Hero />
      <Hobby />
      <Cta />
    </>
  );
}
