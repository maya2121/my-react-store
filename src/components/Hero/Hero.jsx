import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Hero.css";

function Hero() {
  const navigate = useNavigate();
  const baseUrl = "https://armanist.com";
    const defaultSlides = [
    {
      id: "default-1",
      image: "/Images/img3.JPG",
      title: "Welcome to MyStore",
      subtitle: "Best products at the best prices",
      buttonText: "Shop Now",
      buttonLink: "#products-section",
      order: 1
    },
    {
      id: "default-2",
      image: "/Images/img1.JPG",
      title: "Luxury Watches",
      subtitle: "Premium craftsmanship for every occasion",
      buttonText: "Explore",
      buttonLink: "#watches",
      order: 2
    },
    {
      id: "default-3",
      image: "/Images/img2.JPG",
      title: "Signature Accessories",
      subtitle: "Wallets and perfumes designed to impress",
      buttonText: "Discover",
      buttonLink: "#products-section",
      order: 3
    }
  ];

  const [slides, setSlides] = useState(defaultSlides);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${baseUrl}/public/hero-slides`);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setSlides(data);
          setCurrentIndex(0);
        }
      } catch {}
    })();
  }, []);

  useEffect(() => {
    if (!slides.length) return;
    const slider = setInterval(() => {
      setCurrentIndex((prev) =>
        prev === slides.length - 1 ? 0 : prev + 1
      );
    }, 4000);

    return () => clearInterval(slider);
  }, [slides.length]);

  const activeSlide = slides[currentIndex] || defaultSlides[0];

  const handleCta = () => {
    const link = activeSlide?.buttonLink || "#products-section";
    if (link.startsWith("#")) {
      const el = document.getElementById(link.replace("#", ""));
      if (el) el.scrollIntoView({ behavior: "smooth" });
      return;
    }
    if (link.startsWith("http")) {
      window.location.href = link;
      return;
    }
    navigate(link);
  };

    return (
    <div className="hero">
        {slides.map((slide, index) => (
        <img
            key={slide.id || index}
            src={slide.image || "/Images/logo4.png"}
            className={`hero-image ${index === currentIndex ? "active" : ""}`}
            alt="watch"
        />
))}

<div className="hero-overlay"></div>

<div className="hero-content">
        <h1>{activeSlide?.title || "Welcome to MyStore"}</h1>
        <p>{activeSlide?.subtitle || "Best products at the best prices"}</p>
        <button onClick={handleCta}>{activeSlide?.buttonText || "Shop Now"}</button>
</div>
    </div>
);
}

export default Hero;
