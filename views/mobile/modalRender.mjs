// 모바일에서 뒤로가기 버튼 클릭 시 페이지가 닫히는 현상을 방지하기 위해 히스토리를 설정
export const setupModalHistory = (closeModal) => {
  window.history.pushState(null, '', window.location.href);
  window.addEventListener('popstate', closeModal);
};

export const toggleModal = (imageSrc, data) => {
  const modal = document.createElement('div');

  modal.className = 'modal';
  modal.innerHTML = `
      <div class="modal-header">
        <button
          id="close-modal"
          className="flex gap-2 items-center border border-black p-2 rounded-3xl"
        >
          <span></span>
          재촬영
        </button>
      </div>
      <div class="modal-content">
        <div class="img">
          <img src="${imageSrc}" alt="captured" />
        </div>
        <div class="data">
          <div>데이터</div>
        </div>
      </div>
    `;
  document.body.appendChild(modal);

  const closeButton = modal.querySelector('#close-modal');
  const closeModal = () => {
    modal.remove();
  };

  setupModalHistory(closeModal); // 히스토리 설정 호출
  closeButton.addEventListener('click', closeModal);
};
