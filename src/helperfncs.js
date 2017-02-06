exports.resizeImage = function (w, h, maxWidth = 1000, maxHeight = 1000) {
  let sw = w;
  let sh = h;
  let aspect = w / h;
  if (sw > maxWidth) {
    sw = maxWidth;
    sh = ~~(sw / aspect);
  }
  if (sh > maxHeight) {
    aspect = w / h;
    sh = maxHeight;
    sw = ~~(sh * aspect);
  }
  return {sw, sh};
};
exports.toImg = function(encodedData) {
  const imgElement = document.createElement('img');
  imgElement.src = encodedData;
  return imgElement;
};

exports.toPng = function(canvas) {
  const img = document.createElement('img');
  img.src = canvas.toDataURL('image/png');
  return img;
};

