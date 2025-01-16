import { hidePluginWindow } from './utils';
import { v4 as uuid } from 'uuid';
import io from 'socket.io-client';

// Global variables
let videoTransferFileName: string | undefined;
let mediaRecorder: MediaRecorder;
let userId: string;
let videoWriteStream: any = null;

// Socket connection
const socket = io(import.meta.env.VITE_SOCKET_URL as string, {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  transports: ['websocket', 'polling'],
});

// Start recording function
export const StartRecording = (onSources: {
  screen: string;
  audio: string;
  id: string;
}) => {
  if (!onSources || !onSources.id || !onSources.screen) {
    console.error('Invalid sources provided for recording.');
    return;
  }

  hidePluginWindow(true);

  // Generate unique filename for the recorded video
  videoTransferFileName = `${uuid()}-${onSources.id.slice(0, 8)}.webm`;

  // Start the MediaRecorder
  if (mediaRecorder) {
    const chunkSize = 1000;
    mediaRecorder.start(chunkSize);
  } else {
    console.error('MediaRecorder is not initialized.');
  }
};

// Stop recording function
export const onStopRecording = () => {
  hidePluginWindow(false);

  if (mediaRecorder) {
    mediaRecorder.stop();
  } else {
    console.error('MediaRecorder is not active.');
  }
};

// MediaRecorder stop event handler
const stopRecording = () => {
  hidePluginWindow(false);

  if (videoTransferFileName && userId) {
    socket.emit('process-video', {
      filename: videoTransferFileName,
      userId,
    });

    if (videoWriteStream) {
      videoWriteStream.end();
      videoWriteStream = null;
    }
  } else {
    console.error('Missing video filename or user ID.');
  }
};

// MediaRecorder data available event handler
export const onDataAvailable = async (e: BlobEvent) => {
  if (e.data.size > 0 && videoTransferFileName) {
    // Send to server immediately
    socket.emit('video-chunks', {
      chunks: e.data,
      filename: videoTransferFileName,
    });

    try {
      // Convert Blob to Buffer
      const arrayBuffer = await e.data.arrayBuffer();

      const result = await window.ipcRenderer.invoke(
        'writeVideoChunk',
        arrayBuffer,
        videoTransferFileName
      );

      if (result.success) {
        console.log('Chunk written successfully');
      } else {
        console.error('Error writing chunk:', result.error);
      }
    } catch (error) {
      console.error('Error writing video chunk to file:', error);
    }
  } else {
    console.error('No data available or filename is missing.');
  }
};

// Select sources for screen and audio recording
export const selectSources = async (onSources: {
  screen: string;
  audio: string;
  id: string;
  preset: 'HD' | 'SD';
}) => {
  if (!onSources || !onSources.screen || !onSources.audio || !onSources.id) {
    console.error('Invalid sources provided.');
    return { stream: null, mediaRecorder: null };
  }

  const videoConstraints: any = {
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: onSources.screen,
        minWidth: onSources.preset === 'HD' ? 1920 : 1280,
        maxWidth: onSources.preset === 'HD' ? 1920 : 1280,
        minHeight: onSources.preset === 'HD' ? 1080 : 720,
        maxHeight: onSources.preset === 'HD' ? 1080 : 720,
        frameRate: {
          min: 30,
          ideal: 60,
          max: 60,
        },
        aspectRatio: 16 / 9,
      },
    },
  };

  userId = onSources.id;

  try {
    // Create screen video stream

    const stream = await navigator.mediaDevices.getUserMedia(videoConstraints);

    // Create audio stream if audio is enabled
    const audioConstraints = {
      video: false,
      audio: {
        deviceId: { exact: onSources.audio },
        sampleRate: 48000,
        sampleSize: 24,
        channelCount: 2,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    };
    const audioStream = await navigator.mediaDevices.getUserMedia(
      audioConstraints
    );

    // Combine video and audio tracks into a single MediaStream
    const combineStream = new MediaStream([
      ...stream.getTracks(),
      ...audioStream.getTracks(),
    ]);

    // Initialize the MediaRecorder
    const recorderOptions = {
      mimeType: 'video/webm;codecs=vp9,opus',
      videoBitsPerSecond: 8000000,
      audioBitsPerSecond: 128000,
    };
    mediaRecorder = new MediaRecorder(combineStream, recorderOptions);

    mediaRecorder.ondataavailable = onDataAvailable;
    mediaRecorder.onstop = stopRecording;

    return { stream: combineStream, mediaRecorder };
  } catch {
    console.error('Error selecting sources:');
    return { stream: null, mediaRecorder: null };
  }
};
