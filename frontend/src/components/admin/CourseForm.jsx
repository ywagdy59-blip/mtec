
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import Input from "../ui/Input";
import Button from "../ui/Button";
import api from "../../services/api";

const LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export default function CourseForm({
  course,
  onSave,
  onCancel,
  saving,
}) {
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [video, setVideo] = useState(null);

  const [v, setV] = useState({
    title: course?.title || "",
    description: course?.description || "",
    price: course?.price ?? "",
    thumbnail: course?.thumbnail || "",
    category:
      typeof course?.category === "object"
        ? course?.category?._id || ""
        : course?.category || "",
    level: course?.level?.toLowerCase() || "beginner",
  });

  const [errors, setErrors] = useState({});

  const set = (key) => (event) => {
    setV((current) => ({
      ...current,
      [key]: event.target.value,
    }));
  };

  // تحميل التصنيفات من الـ Backend
  useEffect(() => {
    let active = true;

    const loadCategories = async () => {
      try {
        const response = await api.get("/catogery");

        const data = response.data;
        const list = Array.isArray(data)
          ? data
          : data?.categories ?? data?.data ?? [];

        if (active) {
          setCategories(list);
        }
      } catch (error) {
        if (active) {
          toast.error(
            error.response?.data?.message ||
              "Failed to load categories"
          );
        }
      } finally {
        if (active) {
          setLoadingCategories(false);
        }
      }
    };

    loadCategories();

    return () => {
      active = false;
    };
  }, []);

  const submit = (event) => {
    event.preventDefault();

    const found = {};

    if (v.title.trim().length < 3) {
      found.title = "Title must be at least 3 characters";
    }

    if (v.description.trim().length < 10) {
      found.description =
        "Description must be at least 10 characters";
    }

    if (
      v.price === "" ||
      !Number.isFinite(Number(v.price)) ||
      Number(v.price) < 0
    ) {
      found.price = "Enter a valid price";
    }

    if (!v.category) {
      found.category = "Please select a category";
    }

    if (!v.level) {
      found.level = "Please select a level";
    }

    if (
      v.thumbnail.trim() &&
      !/^https?:\/\//i.test(v.thumbnail.trim())
    ) {
      found.thumbnail =
        "Thumbnail must be a link starting with http or https";
    }

    setErrors(found);

    if (Object.keys(found).length > 0) return;

    // FormData يسمح بإرسال بيانات الكورس مع ملف الفيديو
    const formData = new FormData();

    formData.append("title", v.title.trim());
    formData.append("description", v.description.trim());
    formData.append("price", String(Number(v.price)));
    formData.append("category", v.category);
    formData.append("level", v.level);
    formData.append("thumbnail", v.thumbnail.trim());

    if (video) {
      formData.append("video", video);
    }

    onSave(formData);
  };

  return (
    <form className="form-grid" onSubmit={submit} noValidate>
      <Input
        label="Title"
        required
        value={v.title}
        onChange={set("title")}
        error={errors.title}
      />

      <Input
        as="textarea"
        label="Description"
        required
        rows={4}
        value={v.description}
        onChange={set("description")}
        error={errors.description}
      />

      <div className="two-col">
        <Input
          label="Price (EGP)"
          required
          type="number"
          min="0"
          value={v.price}
          onChange={set("price")}
          error={errors.price}
          dir="ltr"
        />

        <Input
          as="select"
          label="Level"
          value={v.level}
          onChange={set("level")}
          error={errors.level}
        >
          {LEVELS.map((level) => (
            <option key={level.value} value={level.value}>
              {level.label}
            </option>
          ))}
        </Input>
      </div>

      <div>
        <Input
          as="select"
          label="Category"
          required
          value={v.category}
          onChange={set("category")}
          error={errors.category}
          disabled={loadingCategories}
        >
          <option value="">
            {loadingCategories
              ? "Loading categories..."
              : "Select a category"}
          </option>

          {categories.map((category) => (
            <option
              key={category._id || category.id}
              value={category._id || category.id}
            >
              {category.name}
            </option>
          ))}
        </Input>

        {!loadingCategories && categories.length === 0 && (
          <p className="form-error">
            No categories found. Add a category first.
          </p>
        )}
      </div>

      <Input
        label="Thumbnail image link"
        placeholder="https://..."
        value={v.thumbnail}
        onChange={set("thumbnail")}
        error={errors.thumbnail}
        dir="ltr"
      />

      <div className="form-field">
        <label htmlFor="course-video">
          Course video
        </label>

        <input
          id="course-video"
          type="file"
          accept="video/mp4,video/webm,video/quicktime,video/x-msvideo,video/x-matroska,video/mpeg"
          onChange={(event) => {
            setVideo(event.target.files?.[0] || null);
          }}
          disabled={saving}
        />

        {video && (
          <p className="muted">
            Selected: {video.name}
          </p>
        )}

        {course?.hasVideo && !video && (
          <p className="muted">
            This course already has a video. Leave this empty to keep it.
          </p>
        )}

        <p className="muted">
          Supported video files only. Backend upload limit: 500 MB.
        </p>
      </div>

      <div className="row end">
        <Button
          type="button"
          variant="light"
          onClick={onCancel}
          disabled={saving}
        >
          Cancel
        </Button>

        <Button type="submit" loading={saving}>
          {course ? "Save changes" : "Add course"}
        </Button>
      </div>
    </form>
  );
}
