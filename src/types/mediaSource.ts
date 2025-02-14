
export const MEDIA_ACTIONS = {
  GET_DEVICES: 'GET_DEVICES',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR'
}

export type DisplayDeviceActionProps = {
  type: string;
  payload: SourceDeviceStateProps;
}

export type SourceDeviceStateProps = {
    displays?: {
      appIcons: null;
      display: null;
      displayId: string;
      id: string;
      name: string;
      thumbnail: unknown[];
    }[];
    audioInput?: {
      deviceId: string;
      kind: string;
      label: string;
      groupId: string;
    }[];
    error?: string | null;
    isPending: boolean;
  };
  