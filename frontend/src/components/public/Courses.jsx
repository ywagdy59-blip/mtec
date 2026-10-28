import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Clock, ShoppingCart } from "lucide-react";
import Button from "../ui/Button";
import CheckoutModal from "./CheckoutModal";
import { useLang } from "../../hooks/useLang";
import { getCourses, idOf, money } from "../../services/courseService";

export default function Courses() {
  const { t } = useLang();
  const [courses, setCourses] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getCourses()
      .then((list) => !cancelled && setCourses(list))
      .catch(() => !cancelled && setCourses([]));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="section" id="courses">
      <div className="container">
        <header className="section-head">
          <h2>{t("courses.title")}</h2>
          <p>{t("courses.subtitle")}</p>
        </header>

        {courses && courses.length === 0 && <p className="muted">{t("courses.empty")}</p>}

        <div className="card-grid cols-3">
          {(courses || []).map((course, i) => (
            <motion.article
              key={idOf(course)}
              className="course-card"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: (i % 3) * 0.08, duration: 0.4 }}
            >
              <div className="course-img">
                {course.image ? <img src={course.image} alt="" loading="lazy" /> : <BookOpen size={44} />}
              </div>
              <div className="course-body">
                <h3>{course.title}</h3>
                <div className="course-meta">
                  {course.level && <span>{course.level}</span>}
                  {course.duration && <span><Clock size={12} /> {course.duration}</span>}
                </div>
                <p>{course.description}</p>
                <div className="course-foot">
                  <span className="price">{money(course.price)}</span>
                  <Button size="sm" icon={<ShoppingCart size={16} />} onClick={() => setSelected(course)}>
                    {t("courses.buy")}
                  </Button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>

      {selected && <CheckoutModal course={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}
