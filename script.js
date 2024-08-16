const playButton = document.getElementById("play");
const video = document.getElementById("video");
let isPlaying = false; // Track the state of the video
let detectionInterval; // Store the interval ID for face detection

playButton.addEventListener("click", () => {
  if (isPlaying) {
    stopVideo();
  } else {
    startVideo();
  }
  isPlaying = !isPlaying; // Toggle the play state
  playButton.textContent = isPlaying ? "pause" : "detect my mood"; // Update button text
});

function startVideo() {
  Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri("./models"),
    faceapi.nets.faceLandmark68Net.loadFromUri("./models"),
    faceapi.nets.faceRecognitionNet.loadFromUri("./models"),
    faceapi.nets.faceExpressionNet.loadFromUri("./models"),
  ]).then(() => {
    navigator.getUserMedia(
      { video: {} },
      (stream) => {
        video.srcObject = stream;
        video.play();

        // Start detection after the video is loaded and starts playing
        video.addEventListener("loadeddata", startDetection);
      },
      (error) => console.error(error)
    );
  });
}

function stopVideo() {
  const stream = video.srcObject;
  if (stream) {
    const tracks = stream.getTracks();
    tracks.forEach((track) => track.stop()); // Stop all tracks to stop the video
  }
  video.pause();
  stopDetection(); // Stop face detection
}

function startDetection() {
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  detectionInterval = setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();

    const resizedDetections = faceapi.resizeResults(detections, displaySize);

    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

    faceapi.draw.drawDetections(canvas, resizedDetections);
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

    if (resizedDetections.length > 0) {
      const expressions = resizedDetections[0].expressions;

      let highestEmotion = "";
      let highestValue = 0;

      for (const emotion in expressions) {
        if (expressions[emotion] > highestValue) {
          highestValue = expressions[emotion];
          highestEmotion = emotion;
        }
      }

      let iFrame = document.querySelector("iframe");

      iFrame.style.display = "none";
      if (highestEmotion !== prevEmotion) {
        switch (highestEmotion) {
          case "happy":
            document.body.style.backgroundColor = "yellow";
            document.body.style.transition = "1s";
            displaySong(
              "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/1301020471&color=%23ff5500&auto_play=true&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true"
            );
            break;
          case "sad":
            document.body.style.backgroundColor = "blue";
            document.body.style.transition = "1s";
            displaySong(
              "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/1640100321&color=%23ff5500&auto_play=true&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true"
            );
            break;
          case "angry":
            document.body.style.backgroundColor = "red";
            document.body.style.transition = "1s";
            displaySong(
              "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/1015367506&color=%23ff5500&auto_play=true&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true"
            );
            break;
          case "surprised":
            document.body.style.backgroundColor = "purple";
            document.body.style.transition = "1s";
            displaySong(
              "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/386248376&color=%23ff5500&auto_play=true&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true"
            );
            break;
          case "disgusted":
            document.body.style.backgroundColor = "orange";
            document.body.style.transition = "1s";
            displaySong(
              "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/925433074&color=%23ff5500&auto_play=true&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true"
            );
            break;
          default:
            document.body.style.backgroundColor = "black";
            document.body.style.transition = "1s";
            displaySong();
            break;
        }

        prevEmotion = highestEmotion;
      }
    }
  }, 500);
}

function stopDetection() {
  clearInterval(detectionInterval); // Stop the interval for face detection
  const canvas = document.querySelector("canvas");
  if (canvas) {
    canvas.remove(); // Remove the canvas from the document
  }
}

let prevEmotion = null;

function displaySong(highestEmotion) {
  let iFrame = document.querySelector("iframe");
  iFrame.style.display = "flex";
  iFrame.src = highestEmotion;
}
