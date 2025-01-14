import { onStopRecording, selectSources, StartRecording } from '@/lib/recorder';
import { cn, videoRecordingTime } from '@/lib/utils';
import { Cast, Pause, Square } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const StudioTray = () => {
  const initialTime = new Date();
  const videoElement = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);

  const [preview, setPreview] = useState(false);
  const [onTimer, setOnTimer] = useState<string>('00:00:00');
  const [count, setCount] = useState<number>(0);
  const [recording, setRecording] = useState(false);
  const [onSources, setOnSources] = useState<
    | {
        screen: string;
        id: string;
        audio: string;
        preset: 'HD' | 'SD';
        plan: 'PRO' | 'FREE';
      }
    | undefined
  >(undefined);

  // Listen for profile data
  window.ipcRenderer.on('profile-received', (_, payload) => {
    setOnSources(payload);
  });

  useEffect(() => {
    // Setup function
    const setupSources = async () => {
      if (onSources && onSources.screen) {
        // Only create new streams if we don't have one or sources changed
        if (!streamRef.current) {
          const { stream, mediaRecorder } = await selectSources(onSources);
          streamRef.current = stream;
          recorderRef.current = mediaRecorder;
        }
      }
    };

    setupSources();

    // Cleanup function
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
    // preview mode
    if (videoElement.current && streamRef.current) {
      videoElement.current.srcObject = preview ? streamRef.current : null;
    }
  }, [preview]);

  // Timer and recording management
  useEffect(() => {
    if (!recording) return;

    const recordTimeInterval = setInterval(() => {
      const time = count + (new Date().getTime() - initialTime.getTime());
      const recordingTime = videoRecordingTime(time);

      setCount(time);
      setOnTimer(recordingTime.length);

      if (onSources?.plan === 'FREE' && recordingTime.minute == '05') {
        setRecording(false);
        clearTime();
        onStopRecording();
      }
    }, 100);
    return () => clearInterval(recordTimeInterval);
  }, [recording]);

  // Stop recording
  const stopRecording = () => {
    setRecording(false);
    clearTime();
    onStopRecording();
  };

  // Reset timer
  const clearTime = () => {
    setOnTimer('00:00:00');
    setCount(0);
  };

  // UI Rendering
  return !onSources ? (
    <>No sources available</>
  ) : (
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
          onClick={() => {
            setRecording(true);
            StartRecording({
              audio: onSources.audio,
              id: onSources.id,
              screen: onSources.screen,
            });
          }}
          className={cn(
            'non-draggable rounded-full cursor-pointer relative hover:opacity-80',
            recording ? 'bg-red-500 w-6 h-6' : 'bg-red-400 w-8 h-8'
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
