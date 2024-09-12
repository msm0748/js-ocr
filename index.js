import { cropImage } from './cropImage.mjs';

const video = document.getElementById('webcam');
const switchButton = document.getElementById('switchCamera');
const torchButton = document.getElementById('torch');
const captureButton = document.getElementById('capture');
const canvas = document.getElementById('canvas');
const capturedImage = document.getElementById('capturedImage');
const guideLine = document.getElementById('guideLine');
let originalImageSrc;

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

// 카메라 설정 함수
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
        width: { ideal: videoConstraints.width },
        height: { ideal: videoConstraints.height },
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

// 플래시 상태 업데이트 함수
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

// 이미지 캡처 함수
async function captureImage() {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  canvas.getContext('2d').drawImage(video, 0, 0);
  const imageSrc = canvas.toDataURL('image/png');

  return imageSrc;
}

// 카메라 모드 전환 함수
function toggleCameraMode() {
  currentFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
}

// 카메라 트랙 중지 함수
function stopCurrentTrack() {
  if (track) {
    track.stop();
  }
}

// 버튼 클릭 시 실행되는 함수
async function handleSwitchButtonClick() {
  stopCurrentTrack(); // 현재 트랙 중지
  toggleCameraMode(); // 카메라 모드 전환
  await setupCamera(); // 새로운 스트림으로 카메라 설정
}

// 캡처 버튼 클릭 시 실행되는 함수
async function handleCaptureButtonClick() {
  const imageSrc = await captureImage();
  originalImageSrc = imageSrc;
  capturedImage.src = imageSrc;
  const cropImageSrc = await cropImage(
    imageSrc,
    guideLine.getBoundingClientRect(),
    viewSize
  );
}

// 플래시 버튼 클릭 시 실행되는 함수
async function handleTorchButtonClick() {
  if (!track) return;

  torch = !torch;
  await updateTorchState();
}

switchButton.addEventListener('click', handleSwitchButtonClick);
captureButton.addEventListener('click', handleCaptureButtonClick);
torchButton.addEventListener('click', handleTorchButtonClick);

// 즉시 실행 함수
(async function () {
  await setupCamera();
})();
