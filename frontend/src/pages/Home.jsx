import { useState } from "react";
import Hero from "../components/public/Hero";
import Services from "../components/public/Services";
import Courses from "../components/public/Courses";
import About from "../components/public/About";
import WhyUs from "../components/public/WhyUs";
import Testimonials from "../components/public/Testimonials";
import Contact from "../components/public/Contact";

export default function Home() {
  // clicking "Request this service" pre-selects it in the lead form
  const [service, setService] = useState("");

  const chooseService = (value) => {
    setService(value);
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <Hero />
      <Services onSelect={chooseService} />
      <Courses />
      <About />
      <WhyUs />
      <Testimonials />
      <Contact service={service} onServiceChange={setService} />
    </>
  );
}
