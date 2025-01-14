import { useEffect, useRef } from 'react';

const Webcam = () => {
  const webcamRef = useRef<HTMLVideoElement | null>(null);

  const streamWebcam = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });

    if (webcamRef && webcamRef.current) {
      webcamRef.current.srcObject = stream;

      await webcamRef.current.play();
    }
  };

  useEffect(() => {
    streamWebcam();
  }, []);

  return (
    <video
      ref={webcamRef}
      className="draggable relative h-screen object-cover aspect-video border-2 border-muted-foreground rounded-full"
    />
  );
};

export default Webcam;
