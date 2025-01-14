import { updateStudioSettingsSchema } from '@/schemas/studio-setting-schema';
import { useZodForm } from './useZodForm';
import { useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { updateStudioSettings } from '@/lib/utils';
import { toast } from 'sonner';

export const useStudioSettings = (
  id: string,
  screen?: string | null,
  audio?: string | null,
  preset?: 'HD' | 'SD',
  plan?: 'PRO' | 'FREE'
) => {

  const { mutate, isPending } = useMutation({
    mutationKey: ['update-studio'],
    mutationFn: (data: {
      screen: string;
      id: string;
      audio: string;
      preset: 'HD' | 'SD';
    }) => updateStudioSettings(data.id, data.screen, data.audio, data.preset),
    onSuccess: data => {
      toast(data.status === 200 ? 'Success' : 'Error', {
        description: data.Message,
      });
    },
  });

  const { register, watch } = useZodForm(updateStudioSettingsSchema, mutate, {
    screen: screen || '',
    audio: audio || '',
    preset: preset || 'SD',
    id: id,
  });

  useEffect(() => {
    if (screen && audio) {
      window.ipcRenderer.send('media-sources', {
        screen,
        id: id,
        audio,
        preset,
      });
    }
  }, [screen, audio]);

  useEffect(() => {
    const subscribe = watch(values => {
      mutate({
        screen: values.screen || '',
        audio: values.audio || '',
        preset: values.preset || 'SD',
        id,
      });
      window.ipcRenderer.send('media-sources', {
        screen: values.screen,
        id,
        audio: values.audio,
        preset: values.preset,
        plan,
      });
    });
    return () => subscribe.unsubscribe();
  }, [watch]);

  return { register, isPending };
};
