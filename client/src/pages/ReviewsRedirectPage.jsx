import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getTrainerStats } from "../api/dashboard";

export default function ReviewsRedirectPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const redirectToBestReviewTarget = async () => {
      try {
        const { data } = await getTrainerStats();

        const courseId = data?.data?.defaultPendingCourseId;

        if (courseId) {
          navigate(`/course-submissions/${courseId}?status=submitted`, {
            replace: true,
          });
        } else {
          navigate("/dashboard", { replace: true });
        }
      } catch (err) {
        console.error("REVIEWS REDIRECT ERROR:", err);
        navigate("/dashboard", { replace: true });
      }
    };

    redirectToBestReviewTarget();
  }, [navigate]);

  return <p style={{ padding: "2rem" }}>Loading reviews...</p>;
}