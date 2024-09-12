const video = document.getElementById('webcam');
const switchButton = document.getElementById('switchCamera');
const torchButton = document.getElementById('torch');

const videoConstraints = {
  width: 1920,
  height: 1080,
};

let track = null;
let currentFacingMode = 'environment';
let torch = false;

const viewSize = {
  width: window.innerWidth,
  height: window.innerHeight,
};

async function setupCamera() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === 'videoinput');

    if (cameras.length === 0) {
      throw '이 기기에서 카메라를 찾을 수 없습니다.';
    }
    const camera = cameras[cameras.length - 1];

    // 스트림 생성 및 비디오 트랙 가져오기
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: camera.deviceId,
        facingMode: currentFacingMode,
        height: { ideal: 1080 },
        width: { ideal: 1920 },
      },
    });

    track = stream.getVideoTracks()[0];
    const capabilities = track.getCapabilities();
    const isTorch = capabilities.torch;

    if (isTorch) {
      torchButton.style.visibility = 'visible';
      updateTorchState();
    } else {
      torchButton.style.visibility = 'hidden';
    }
    video.srcObject = stream;
  } catch (error) {
    console.error('카메라 설정 중 오류 발생:', error);
  }
}

async function toggleTorch() {
  if (!track) return;

  torch = !torch;
  await updateTorchState();
}

async function updateTorchState() {
  try {
    await track.applyConstraints({
      advanced: [{ torch }],
    });
    torchButton.classList.toggle('off', torch === false);
  } catch (error) {
    console.error('플래시 제어 중 오류 발생:', error);
    torch = false;
    torchButton.classList.toggle('off', torch === false);
  }
}

switchButton.addEventListener('click', async () => {
  if (track) {
    track.stop();
  }

  // 카메라 모드 전환
  currentFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';

  // 새 스트림으로 카메라 설정
  await setupCamera();
});

torchButton.addEventListener('click', toggleTorch);

(async function () {
  await setupCamera();
})();
