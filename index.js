const video = document.getElementById('webcam');
const switchButton = document.getElementById('switchCamera');
let currentFacingMode = 'environment';
const videoConstraints = {
  width: 1920,
  height: 1080,
};
let torch = false;

const viewSize = {
  width: window.innerWidth,
  height: window.innerHeight,
};

async function setupCamera() {
  navigator.mediaDevices.enumerateDevices().then((devices) => {
    const cameras = devices.filter((device) => device.kind === 'videoinput');

    if (cameras.length === 0) {
      throw 'No camera found on this device.';
    }
    const camera = cameras[cameras.length - 1];

    // Create stream and get video track
    navigator.mediaDevices
      .getUserMedia({
        video: {
          deviceId: camera.deviceId,
          facingMode: currentFacingMode,
          height: { ideal: 1080 },
          width: { ideal: 1920 },
        },
      })
      .then((stream) => {
        const track = stream.getVideoTracks()[0];
        const btn = document.querySelector('#torch');
        btn.addEventListener('click', function () {
          torch = !torch;
          track.applyConstraints({
            advanced: [{ torch }],
          });
        });
        video.srcObject = stream;
      });
  });
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
