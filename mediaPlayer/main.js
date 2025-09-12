/* find the elements i want to interact with*/
const videoElement = document.querySelection("mediaPlayer");
const playPauseButton = document.querySelection("#playPauseButton");
const timeline = document.querySelection("timelineProgress");

/* when JS loads remove default controls*/
videoElement.removeAttribute("controls");

/*
 Play/pause button behaviour:
 if media is not playing - when I click it begins the playback of the media file
 if media is playing - when I click again it pauses the playback of the media file
 Feedback:
 toggle icon based on playing state
 cursor change on hover
 */

function playPause() {
  if (videoElement.paused || videoElement.ended) {
    videoElement.play();
  } else {
    videoElement.pause();
    playPauseButton.textContent = "▶";
  }
}

playPauseButton.addEventListener("click", playPause);

/*
 Timeline behavior:
 it should update as media playback occurs to show current time
 i should be able to click and jump to particular time
 */

function updateTimeline() {
  console.log(videoElement.currentTime);
  /* find percentage of total time*/
  let timePercent = videoElement.currentTime / videoElement.duration;
  //console.log(timePercent);
  timeline.value = timePercent;
}

videoElement.addEventListener("timeupdate", updateTimeline);
