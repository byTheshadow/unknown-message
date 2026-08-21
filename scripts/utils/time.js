(() => {
  function formatDuration(totalSeconds) {
    const safeSeconds = Math.max(0, Math.ceil(Number(totalSeconds) || 0));
    const minutes = String(Math.floor(safeSeconds / 60)).padStart(2, "0");
    const seconds = String(safeSeconds % 60).padStart(2, "0");

    return `${minutes}:${seconds}`;
  }

  window.UnknownMessageTime = {
    formatDuration
  };
})();
