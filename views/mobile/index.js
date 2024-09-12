import { cropImage } from '../../lib/cropImage.mjs';
import { toggleModal } from './modalRender.mjs';

const video = document.getElementById('webcam');
const switchButton = document.getElementById('switchCamera');
const torchButton = document.getElementById('torch');
const captureButton = document.getElementById('capture');
const canvas = document.getElementById('canvas'); // 캡처한 이미지를 그릴 캔버스
let originalImageSrc; // 캡처한 이미지의 원본 소스
let videoResolution; // 비디오 해상도

let track = null;
let currentFacingMode = 'environment';
let torch = false; // 플래시 상태

const viewSize = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// 카메라 설정 함수
async function setupCamera() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === 'videoinput');

    console.log(cameras, 'cameras');
    if (cameras.length === 0) {
      throw '이 기기에서 카메라를 찾을 수 없습니다.';
    }
    const camera = cameras[cameras.length - 1];

    // 스트림 생성 및 비디오 트랙 가져오기
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: camera.deviceId,
        facingMode: { exact: currentFacingMode },
        // ideal 속성은 최적의 해상도를 요청하는 것이지, 반드시 그 해상도로 설정되는 것은 아님
        width: { ideal: 1920 },
        height: { ideal: 1080 },
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
    videoResolution = {
      width: track.getSettings().width,
      height: track.getSettings().height,
    };
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

  console.log(video.src);

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
  // console.log(imageSrc);
  originalImageSrc = imageSrc;
  const guideLine = document.getElementById('guideLine'); // 가이드 라인

  const cropImageSrc = await cropImage(
    imageSrc,
    guideLine.getBoundingClientRect(),
    videoResolution,
    viewSize
  );

  toggleModal(cropImageSrc);
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

window.addEventListener('load', async () => {
  await setupCamera();
});
