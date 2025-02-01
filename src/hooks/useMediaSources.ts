import { useReducer } from 'react';
import { getMediaSources } from '@/lib/utils';
import {
  MEDIA_ACTIONS,
  DisplayDeviceActionProps,
  SourceDeviceStateProps,
} from '@/types/mediaSource';

const initialState: SourceDeviceStateProps = {
  displays: [],
  audioInput: [],
  error: null,
  isPending: false,
};

const mediaSourcesReducer = (
  state: SourceDeviceStateProps,
  action: DisplayDeviceActionProps
): SourceDeviceStateProps => {
  switch (action.type) {
    case MEDIA_ACTIONS.GET_DEVICES:
      return { ...state, ...action.payload };
    case MEDIA_ACTIONS.SET_LOADING:
      return { ...state, isPending: true, error: null };
    case MEDIA_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload.error, isPending: false };
    default:
      return state;
  }
};

export const useMediaSources = () => {
  const [state, dispatch] = useReducer(mediaSourcesReducer, initialState);

  const fetchMediaResources = async () => {
    try {
      dispatch({
        type: MEDIA_ACTIONS.SET_LOADING,
        payload: { isPending: true },
      });
      const sources = await getMediaSources();
      dispatch({
        type: MEDIA_ACTIONS.GET_DEVICES,
        payload: {
          displays: sources.displays,
          audioInput: sources.audio,
          isPending: false,
        },
      });
    } catch (error) {
      console.error('Failed to fetch media sources:', error);
      dispatch({
        type: MEDIA_ACTIONS.SET_ERROR,
        payload: {
          error: 'Failed to fetch media sources',
          isPending: false,
        },
      });
    }
  };

  return {
    state,
    fetchMediaResources,
  };
};
