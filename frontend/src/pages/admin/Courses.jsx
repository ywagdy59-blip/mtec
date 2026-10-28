
import { useEffect, useState } from "react";
import { BookOpen, Pencil, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import CourseForm from "../../components/admin/CourseForm";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Button from "../../components/ui/Button";
import { PageLoader } from "../../components/ui/Spinner";

import {
  createCourse,
  deleteCourse,
  getAdminCourses,
  idOf,
  money,
  updateCourse,
} from "../../services/courseService";

import { getErrorMessage } from "../../utils/format";

export default function Courses() {
  const [courses, setCourses] = useState(null);
  const [error, setError] = useState("");

  // null = المودال مقفول، {} = إضافة كورس، course = تعديل كورس
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const [target, setTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // تحميل كل الكورسات للأدمن، حتى الكورسات غير المنشورة
  const load = async () => {
    try {
      setError("");

      const data = await getAdminCourses();
      setCourses(data);
    } catch (e) {
      setError(getErrorMessage(e));
    }
  };

  useEffect(() => {
    load();
  }, []);

  // إضافة كورس جديد أو تعديل كورس موجود
  const save = async (data) => {
    setSaving(true);

    try {
      if (editing && idOf(editing)) {
        await updateCourse(idOf(editing), data);
        toast.success("Course updated successfully");
      } else {
        await createCourse(data);
        toast.success("Course added successfully");
      }

      setEditing(null);
      await load();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  // حذف كورس
  const remove = async () => {
    if (!target || !idOf(target)) return;

    setDeleting(true);

    try {
      await deleteCourse(idOf(target));

      toast.success("Course deleted successfully");
      setTarget(null);

      await load();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <header className="admin-head">
        <div>
          <h1>Courses</h1>

          <p className="muted">
            {courses ? `${courses.length} total` : "Loading..."}
          </p>
        </div>

        <Button
          icon={<Plus size={18} />}
          onClick={() => setEditing({})}
        >
          Add course
        </Button>
      </header>

      {error ? (
        <div>
          <p className="form-error" role="alert">
            {error}
          </p>

          <Button onClick={load}>Try again</Button>
        </div>
      ) : !courses ? (
        <PageLoader />
      ) : courses.length === 0 ? (
        <div className="empty">
          <BookOpen size={36} />
          <h3>No courses yet</h3>
          <p>
            Add your first course and it will appear on the website.
          </p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="leads-table">
            <thead>
              <tr>
                <th>Course</th>
                <th>Category</th>
                <th>Level</th>
                <th>Price</th>
                <th>Video</th>
                <th className="th-actions">Actions</th>
              </tr>
            </thead>

            <tbody>
              {courses.map((course) => {
                const category =
                  typeof course.category === "object"
                    ? course.category?.name || course.category?.title
                    : null;

                return (
                  <tr key={idOf(course)}>
                    <td data-label="Course">
                      <div className="row">
                        {course.thumbnail ? (
                          <img
                            className="course-thumb"
                            src={course.thumbnail}
                            alt={course.title || "Course thumbnail"}
                          />
                        ) : (
                          <span className="course-thumb" />
                        )}

                        <span className="lead-name">
                          {course.title}
                        </span>
                      </div>
                    </td>

                    <td data-label="Category">
                      {category || "-"}
                    </td>

                    <td data-label="Level">
                      {course.level || "-"}
                    </td>

                    <td data-label="Price" className="num">
                      {money(course.price)}
                    </td>

                    <td data-label="Video">
                      {course.hasVideo ? "Available" : "No video"}
                    </td>

                    <td data-label="Actions" className="td-actions">
                      <div className="actions">
                        <button
                          type="button"
                          className="btn btn-light btn-sm btn-icon"
                          onClick={() => setEditing(course)}
                          aria-label={`Edit ${course.title}`}
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          className="btn btn-danger-soft btn-sm btn-icon"
                          onClick={() => setTarget(course)}
                          aria-label={`Delete ${course.title}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <Modal
          open
          onClose={saving ? undefined : () => setEditing(null)}
          title={idOf(editing) ? "Edit course" : "Add course"}
        >
          <CourseForm
            course={idOf(editing) ? editing : null}
            onSave={save}
            onCancel={() => setEditing(null)}
            saving={saving}
          />
        </Modal>
      )}

      <ConfirmDialog
        open={Boolean(target)}
        title="Delete course"
        message="Are you sure you want to delete this course?"
        loading={deleting}
        onConfirm={remove}
        onCancel={() => setTarget(null)}
      />
    </>
  );
}
