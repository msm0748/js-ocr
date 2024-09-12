export function cropImage(imageSrc, guidelineRect, videoResolution, viewSize) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // 비디오 해상도와 실제 이미지 크기 사이의 비율 계산
      const scaleX = img.width / videoResolution.width;
      const scaleY = img.height / videoResolution.height;

      // 비디오 요소 크기와 비디오 해상도 사이의 비율 계산
      const videoElementScaleX = viewSize.width / videoResolution.width;
      const videoElementScaleY = viewSize.height / videoResolution.height;

      // 이미지 좌표에 맞게 가이드라인 사각형 조정
      const adjustedGuidelineRect = {
        left: guidelineRect.left / videoElementScaleX,
        top: guidelineRect.top / videoElementScaleY,
        width: guidelineRect.width / videoElementScaleX,
        height: guidelineRect.height / videoElementScaleY,
      };

      // 조정된 가이드라인과 스케일을 기반으로 자르기 치수 계산
      const cropX = adjustedGuidelineRect.left * scaleX;
      const cropY = adjustedGuidelineRect.top * scaleY;
      const cropWidth = adjustedGuidelineRect.width * scaleX;
      const cropHeight = adjustedGuidelineRect.height * scaleY;

      canvas.width = cropWidth;
      canvas.height = cropHeight;

      ctx.drawImage(
        img,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        cropWidth,
        cropHeight
      );

      const croppedImageSrc = canvas.toDataURL('image/png');

      resolve(croppedImageSrc);
    };
    img.src = imageSrc;
  });
}
