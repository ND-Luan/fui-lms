async function initialize() {
  console.log('hello')
}
function secondsToMinuteSecond(totalSeconds) {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
    return { minutes: 0, seconds: 0 };
  }
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes} phút ${seconds} giây`;
}
vueData.initialize = initialize