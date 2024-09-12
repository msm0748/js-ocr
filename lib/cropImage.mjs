export const cropImage = async (image, crop, viewSize) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = function () {
      canvas.width = viewSize.width;
      canvas.height = viewSize.height;

      ctx.drawImage(img, 0, 0, viewSize.width, viewSize.height);

      const x = crop.x;
      const y = crop.y;
      const width = crop.width;
      const height = crop.height;

      try {
        const imageData = ctx.getImageData(x, y, width, height);

        const croppedCanvas = document.createElement('canvas');
        const croppedCtx = croppedCanvas.getContext('2d');
        croppedCanvas.width = width;
        croppedCanvas.height = height;
        croppedCtx.putImageData(imageData, 0, 0);

        const croppedBase64Data = croppedCanvas.toDataURL();

        resolve(croppedBase64Data);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = function () {
      reject(new Error('Failed to load image'));
    };

    img.src = image;
  });
};
