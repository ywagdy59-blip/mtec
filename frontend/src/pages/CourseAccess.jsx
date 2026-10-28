import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Button from "../components/ui/Button";
import { PageLoader } from "../components/ui/Spinner";
import { getGuestCourseAccess } from "../services/courseService";
import { API_URL } from "../utils/constants";
import { getErrorMessage } from "../utils/format";

export default function CourseAccess() {
  const { token } = useParams();
  const [course, setCourse] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getGuestCourseAccess(token)
      .then((data) => active && setCourse(data))
      .catch((requestError) => active && setError(getErrorMessage(requestError)));
    return () => {
      active = false;
    };
  }, [token]);

  if (error) {
    return (
      <section className="container not-found">
        <h1>Course link unavailable</h1>
        <p role="alert">{error}</p>
        <Button to="/#courses">Back to courses</Button>
      </section>
    );
  }

  if (!course) return <PageLoader />;

  return (
    <section className="container section">
      <header className="section-head">
        <h1>{course.title}</h1>
        {course.level && <p>{course.level}</p>}
      </header>
      <p>{course.description}</p>
      {course.hasVideo ? (
        <video
          controls
          playsInline
          preload="metadata"
          poster={course.thumbnail || undefined}
          src={`${API_URL}${course.videoUrl}`}
          style={{ display: "block", width: "100%", marginTop: "1.5rem", borderRadius: "16px", background: "#000" }}
        >
          Your browser does not support video playback.
        </video>
      ) : (
        <p className="muted" style={{ marginTop: "1.5rem" }}>
          Course video is not available yet. Contact us for help.
        </p>
      )}
    </section>
  );
}
