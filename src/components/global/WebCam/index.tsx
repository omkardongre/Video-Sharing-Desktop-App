import { useEffect, useRef } from 'react';

const Webcam = () => {
  const webcamRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const streamWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });

      streamRef.current = stream;

      if (webcamRef.current) {
        webcamRef.current.srcObject = stream;
        try {
          await webcamRef.current.play();
        } catch (err) {
          console.error('Error playing video:', err);
        }
      }
    } catch (err) {
      console.error('Error accessing webcam:', err);
    }
  };

  useEffect(() => {
    streamWebcam();

    return () => {
      // Cleanup: stop all tracks when component unmounts
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (webcamRef.current) {
        webcamRef.current.srcObject = null;
      }
    };
  }, []);

  return (
    <video
      ref={webcamRef}
      className="draggable relative h-screen object-cover aspect-video border-2 border-muted-foreground rounded-full"
    />
  );
};

export default Webcam;
