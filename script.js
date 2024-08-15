const video = document.getElementById("video");

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("./models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("./models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("./models"),
  faceapi.nets.faceExpressionNet.loadFromUri("./models"),
]).then(startVideo);

function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    (stream) => (video.srcObject = stream),
    (error) => console.error(error)
  );
}

startVideo();

let prevEmotion = null;

video.addEventListener("play", () => {
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {
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
              "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/729308781&color=%23ff5500&auto_play=true&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true"
            );
            break;
          case "neutral":
            document.body.style.backgroundColor = "grey";
            document.body.style.transition = "1s";
            displaySong(
              "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/98245809&color=%23ff5500&auto_play=true&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true"
            );
            break;
          default:
            document.body.style.backgroundColor = "black";
            document.body.style.transition = "1s";
            displaySong(
              "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/573710472&color=%23ff5500&auto_play=true&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true"
            );
            break;
        }

        prevEmotion = highestEmotion;
      }
    }
  }, 500);
});

let playedSong = false;

function displaySong(highestEmotion) {
  let iFrame = document.querySelector("iframe");
  iFrame.style.display = "flex";
  iFrame.src = highestEmotion;

  playedSong = true;
}
