import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { useLang } from "../../hooks/useLang";
import { getReviews, idOf } from "../../services/courseService";

// shown until the admin adds real reviews from the dashboard
const FALLBACK = [
  { id: "f1", name: "Ahmed Hassan", role: "Founder, ABC Store", rating: 5, text: "They delivered our online store on time and explained every step. Sales went up in the first month." },
  { id: "f2", name: "Mona Adel", role: "Clinic manager", rating: 5, text: "Clear communication and weekly demos. The booking system is exactly what our clinic needed." },
  { id: "f3", name: "Omar Khaled", role: "Course student", rating: 4, text: "The course was practical and the instructors answered every question I had." },
];

export function Stars({ value = 5 }) {
  return (
    <span className="stars" aria-label={`${value} / 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={16} fill={n <= value ? "currentColor" : "none"} />
      ))}
    </span>
  );
}

export default function Testimonials() {
  const { t } = useLang();
  const [reviews, setReviews] = useState(FALLBACK);

  useEffect(() => {
    let cancelled = false;
    getReviews()
      .then((list) => !cancelled && list.length && setReviews(list))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="section section-alt" id="reviews">
      <div className="container">
        <header className="section-head">
          <h2>{t("reviews.title")}</h2>
          <p>{t("reviews.subtitle")}</p>
        </header>

        <div className="card-grid cols-3">
          {reviews.map((r, i) => (
            <motion.figure
              key={idOf(r)}
              className="review-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: (i % 3) * 0.08, duration: 0.4 }}
            >
              <Quote size={26} className="why-icon" />
              <Stars value={r.rating} />
              <blockquote>{r.text ?? r.comment}</blockquote>
              <figcaption>
                <span className="avatar">{r.name?.[0]?.toUpperCase()}</span>
                <span><strong>{r.name}</strong>{r.role && <small>{r.role}</small>}</span>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
