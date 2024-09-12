const video = document.getElementById('webcam');
const switchButton = document.getElementById('switchCamera');
let currentFacingMode = 'environment';
const videoConstraints = {
  width: 1920,
  height: 1080,
};

const viewSize = {
  width: window.innerWidth,
  height: window.innerHeight,
};

async function setupCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: currentFacingMode, ...videoConstraints },
    });
    video.style.width = viewSize.width + 'px';
    video.style.height = viewSize.height + 'px';
    video.srcObject = stream;
  } catch (error) {
    console.error('카메라 접근 오류:', error);
    alert('카메라 접근에 실패했습니다. 카메라 권한을 확인해주세요.');
  }
}

switchButton.addEventListener('click', async () => {
  // 현재 스트림 중지
  const currentStream = video.srcObject;
  const tracks = currentStream.getTracks();
  tracks.forEach((track) => track.stop());

  // 카메라 모드 전환
  currentFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';

  // 새 스트림으로 카메라 설정
  await setupCamera();
});

// 초기 카메라 설정
setupCamera();
