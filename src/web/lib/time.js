export const getTime = (tag) => {
  if (tag.match(/^\d+min$/i)) {
    return Number(tag.replace(/min$/i, '')) || 0;
  }
  if (tag.match(/^\d+hour$/i)) {
    return Number(tag.replace(/hour$/i, '')) || 0;
  }
  if (tag.match(/^\d+hours$/i)) {
    return Number(tag.replace(/hours$/i, '')) || 0;
  }
  if (tag.match(/^\d+h$/i)) {
    return Number(tag.replace(/h$/i, '')) || 0;
  }
  return 0;
};

export const formatTime = (duration) => {
  if (duration >= 60) {
    return `${Math.round(duration / 60 * 10) / 10} hr`;
  }
  return `${duration} min`;
};
