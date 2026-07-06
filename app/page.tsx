import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Plates from "@/components/Plates";
import About from "@/components/About";
import Contact from "@/components/Contact";
import Finale from "@/components/Finale";
import Ambient from "@/components/Ambient";

export default function Home() {
  return (
    <>
      <main id="main" className="relative">
        <Ambient />
        <Hero />
        <HowItWorks />
        <Plates />
        <Finale>
          <About />
          <Contact />
        </Finale>
      </main>
      <footer className="border-t border-ink/15 px-6 py-8 md:px-10">
        <div className="mx-auto flex max-w-[74rem] flex-col gap-2 md:flex-row md:items-baseline md:justify-between">
          <p className="anno">ALEXWILDER-DEV — OXFORD · LONDON · LEICESTER</p>
          <p className="anno">© 2026 ALEX WILDER</p>
          <p className="anno">NO TRACKERS · NO COOKIES · JUST A MAILTO</p>
        </div>
      </footer>
    </>
  );
}
