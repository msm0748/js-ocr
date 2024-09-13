const sourceImage = document.getElementById('source-image');
const imageContainer = document.getElementById('image-container');
const cropArea = document.getElementById('crop-area');
const previewCanvas = document.getElementById('preview-canvas');
const ctx = previewCanvas.getContext('2d');

let isDrawing = false;
let isDragging = false;
let startX, startY;
let currentHandle = null;

sourceImage.onload = () => {
  imageContainer.style.width = sourceImage.width + 'px';
  imageContainer.style.height = sourceImage.height + 'px';
};

imageContainer.addEventListener('mousedown', startDrawing);
imageContainer.addEventListener('mousemove', draw);
imageContainer.addEventListener('mouseup', stopDrawing);

function startDrawing(e) {
  const rect = imageContainer.getBoundingClientRect();
  startX = e.clientX - rect.left;
  startY = e.clientY - rect.top;

  // 크롭 영역 밖에서 클릭하면 새로 그리기 시작
  if (!isPointInCropArea(startX, startY)) {
    isDrawing = true;
    cropArea.style.left = startX + 'px';
    cropArea.style.top = startY + 'px';
    cropArea.style.width = '0px';
    cropArea.style.height = '0px';
    cropArea.style.display = 'block';
    cropArea.innerHTML = ''; // 기존 핸들 제거
  }
}

function isPointInCropArea(x, y) {
  const rect = cropArea.getBoundingClientRect();
  const containerRect = imageContainer.getBoundingClientRect();
  return (
    x >= rect.left - containerRect.left &&
    x <= rect.right - containerRect.left &&
    y >= rect.top - containerRect.top &&
    y <= rect.bottom - containerRect.top
  );
}

function draw(e) {
  if (!isDrawing) return;

  const rect = imageContainer.getBoundingClientRect();
  let currentX = e.clientX - rect.left;
  let currentY = e.clientY - rect.top;

  let width = currentX - startX;
  let height = currentY - startY;

  // 이미지 경계 내로 제한
  if (startX + width < 0) width = -startX;
  if (startY + height < 0) height = -startY;
  if (startX + width > sourceImage.width) width = sourceImage.width - startX;
  if (startY + height > sourceImage.height)
    height = sourceImage.height - startY;

  if (width < 0) {
    cropArea.style.left = startX + width + 'px';
    width = Math.abs(width);
  }
  if (height < 0) {
    cropArea.style.top = startY + height + 'px';
    height = Math.abs(height);
  }

  cropArea.style.width = width + 'px';
  cropArea.style.height = height + 'px';

  updateCroppedImage();
}

function stopDrawing() {
  if (isDrawing) {
    isDrawing = false;
    addResizeHandles();
  }
}

function addResizeHandles() {
  const handles = ['nw', 'ne', 'sw', 'se'];
  handles.forEach((handle) => {
    const div = document.createElement('div');
    div.className = `resize-handle ${handle}`;
    div.style.cursor = `${handle}-resize`;
    cropArea.appendChild(div);

    if (handle === 'nw') {
      div.style.top = '-5px';
      div.style.left = '-5px';
    } else if (handle === 'ne') {
      div.style.top = '-5px';
      div.style.right = '-5px';
    } else if (handle === 'sw') {
      div.style.bottom = '-5px';
      div.style.left = '-5px';
    } else if (handle === 'se') {
      div.style.bottom = '-5px';
      div.style.right = '-5px';
    }
  });
}

cropArea.addEventListener('mousedown', startDragging);
document.addEventListener('mousemove', drag);
document.addEventListener('mouseup', stopDragging);

function startDragging(e) {
  e.stopPropagation(); // 이벤트 버블링 방지
  if (isDrawing) return;

  isDragging = true;
  const rect = cropArea.getBoundingClientRect();
  const containerRect = imageContainer.getBoundingClientRect();
  startX = e.clientX - rect.left;
  startY = e.clientY - rect.top;

  if (e.target.classList.contains('resize-handle')) {
    currentHandle = e.target.classList[1];
  } else {
    currentHandle = null;
  }
}

function drag(e) {
  if (!isDragging) return;

  if (currentHandle) {
    resizeCropArea(e);
  } else {
    moveCropArea(e);
  }

  updateCroppedImage();
}

function moveCropArea(e) {
  const rect = imageContainer.getBoundingClientRect();
  let newLeft = e.clientX - rect.left - startX;
  let newTop = e.clientY - rect.top - startY;

  // 경계 확인
  newLeft = Math.max(
    0,
    Math.min(newLeft, sourceImage.width - cropArea.offsetWidth)
  );
  newTop = Math.max(
    0,
    Math.min(newTop, sourceImage.height - cropArea.offsetHeight)
  );

  cropArea.style.left = `${newLeft}px`;
  cropArea.style.top = `${newTop}px`;
}

function resizeCropArea(e) {
  const rect = cropArea.getBoundingClientRect();
  const imageRect = imageContainer.getBoundingClientRect();

  let newLeft = parseInt(cropArea.style.left);
  let newTop = parseInt(cropArea.style.top);
  let newRight = newLeft + parseInt(cropArea.style.width);
  let newBottom = newTop + parseInt(cropArea.style.height);

  const mouseX = e.clientX - imageRect.left;
  const mouseY = e.clientY - imageRect.top;

  if (currentHandle.includes('n')) newTop = mouseY;
  if (currentHandle.includes('s')) newBottom = mouseY;
  if (currentHandle.includes('w')) newLeft = mouseX;
  if (currentHandle.includes('e')) newRight = mouseX;

  // 경계 및 최소 크기 확인
  newLeft = Math.max(0, Math.min(newLeft, sourceImage.width - 20));
  newTop = Math.max(0, Math.min(newTop, sourceImage.height - 20));
  newRight = Math.max(newLeft + 20, Math.min(newRight, sourceImage.width));
  newBottom = Math.max(newTop + 20, Math.min(newBottom, sourceImage.height));

  cropArea.style.left = `${newLeft}px`;
  cropArea.style.top = `${newTop}px`;
  cropArea.style.width = `${newRight - newLeft}px`;
  cropArea.style.height = `${newBottom - newTop}px`;
}

function stopDragging() {
  isDragging = false;
  currentHandle = null;
}

function updateCroppedImage() {
  const scaleX = sourceImage.naturalWidth / sourceImage.width;
  const scaleY = sourceImage.naturalHeight / sourceImage.height;

  const cropX = parseInt(cropArea.style.left) * scaleX;
  const cropY = parseInt(cropArea.style.top) * scaleY;
  const cropWidth = cropArea.offsetWidth * scaleX;
  const cropHeight = cropArea.offsetHeight * scaleY;

  previewCanvas.width = cropWidth;
  previewCanvas.height = cropHeight;

  ctx.drawImage(
    sourceImage,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    0,
    0,
    cropWidth,
    cropHeight
  );
}
