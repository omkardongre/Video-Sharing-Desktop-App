import { onStopRecording, selectSources, StartRecording } from '@/lib/recorder';
import { cn, videoRecordingTime } from '@/lib/utils';
import { Cast, Pause, Square } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface SourcesPayload {
  screen: string;
  id: string;
  audio: string;
  preset: 'HD' | 'SD';
  plan: 'PRO' | 'FREE';
}

const StudioTray = () => {
  const initialTime = useRef(new Date());
  const videoElement = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);

  const [preview, setPreview] = useState(false);
  const [onTimer, setOnTimer] = useState<string>('00:00:00');
  const [recording, setRecording] = useState(false);
  const [onSources, setOnSources] = useState<SourcesPayload | undefined>(
    undefined
  );

  // IPC listener setup
  useEffect(() => {
    const handleProfileReceived = (_: unknown, payload: SourcesPayload) => {
      setOnSources(payload);
    };

    // Add listener
    window.ipcRenderer.on('profile-received', handleProfileReceived);

    // Cleanup listener
    return () => {
      window.ipcRenderer.off('profile-received', handleProfileReceived);
    };
  }, []);

  useEffect(() => {
    const setupSources = async () => {
      if (onSources?.screen && !streamRef.current) {
        try {
          const { stream, mediaRecorder } = await selectSources(onSources);
          if (stream && mediaRecorder) {
            streamRef.current = stream;
            recorderRef.current = mediaRecorder;
          }
        } catch (error) {
          console.error('Error setting up sources:', error);
        }
      }
    };

    setupSources();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (recorderRef.current) {
        recorderRef.current = null;
      }
    };
  }, [onSources]);

  useEffect(() => {
    if (videoElement.current && streamRef.current) {
      videoElement.current.srcObject = preview ? streamRef.current : null;
    }
  }, [preview]);

  useEffect(() => {
    if (!recording) {
      return;
    }

    const recordTimeInterval = setInterval(() => {
      const elapsedTime = new Date().getTime() - initialTime.current.getTime();
      const recordingTime = videoRecordingTime(elapsedTime);

      setOnTimer(recordingTime.length);

      if (onSources?.plan === 'FREE' && recordingTime.minute === '05') {
        stopRecording();
      }
    }, 100);

    return () => clearInterval(recordTimeInterval);
  }, [recording, onSources?.plan]);

  const stopRecording = () => {
    setRecording(false);
    setOnTimer('00:00:00');
    onStopRecording();
    toast('File downloaded successfully');
  };

  const startRecording = () => {
    if (!onSources) return;

    setRecording(true);
    initialTime.current = new Date();
    StartRecording({
      audio: onSources.audio,
      id: onSources.id,
      screen: onSources.screen,
    });
  };

  if (!onSources) {
    return <div className="text-white/60">No sources available</div>;
  }

  return (
    <div className="flex flex-col justify-end gap-y-5 draggable">
      {preview && (
        <video
          autoPlay
          ref={videoElement}
          className={cn('w-6/12 border-2 self-end')}
        />
      )}
      <div className="rounded-full flex justify-around items-center h-20 w-full border-2 bg-[#171717] draggable border-white/40">
        <div
          onClick={startRecording}
          className={cn(
            'non-draggable rounded-full relative',
            recording
              ? ['bg-red-500 w-6 h-6 pointer-events-none opacity-50']
              : ['bg-red-400 w-8 h-8 cursor-pointer hover:opacity-80']
          )}
        >
          {recording && (
            <span className="absolute -right-16 top-1/2 transform -translate-y-1/2 text-white">
              {onTimer}
            </span>
          )}
        </div>
        {recording ? (
          <Square
            size={32}
            className="non-draggable cursor-pointer hover:scale-110 transform transition duration-150"
            fill="white"
            onClick={stopRecording}
            stroke="white"
          />
        ) : (
          <Pause
            className="non-draggable opacity-50"
            size={32}
            fill="white"
            stroke="none"
          />
        )}
        <Cast
          onClick={() => setPreview(prev => !prev)}
          size={32}
          fill="white"
          className="non-draggable cursor-pointer hover:opacity-60"
          stroke="white"
        />
      </div>
    </div>
  );
};

export default StudioTray;
