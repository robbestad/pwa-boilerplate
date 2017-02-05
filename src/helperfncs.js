exports.resizeImage = function (w, h, maxWidth = 600, maxHeight = 600) {
  let sw = w;
  let sh = h;
  let aspect = w / h;
  if (sw > 600) {
    sw = 600;
    sh = ~~(sw / aspect);
  }
  if (sh > 600) {
    aspect = w / h;
    sh = 600;
    sw = ~~(sh * aspect);
  }
  return {sw, sh};
};

