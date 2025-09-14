// app/page.tsx
import Header from "@/app/components/Header";
import Hero from "@/app/components/Hero";
import About from "@/app/components/About";
import Services from "@/app/components/Services";
import Testimonials from "@/app/components/Testimonials"; 
import Partners from "@/app/components/Partners";
import CallToAction from "@/app/components/CallToAction"; 
import Footer from "@/app/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <About />
        <Services />
        <Testimonials />
        <Partners />
        <CallToAction />
      </main>
      <Footer />
    </>
  );
}