// بيخفي اسم ملف الفيديو من الـ API ويرجّع بدله hasVideo
const toPublicCourse = ({ video, __v, ...course }) => ({
  ...course,
  hasVideo: Boolean(video),
});

module.exports = toPublicCourse;