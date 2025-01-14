import { ClerkLoading, SignedIn, useUser } from '@clerk/clerk-react';
import Loader from '../Loader';
import { useEffect, useState } from 'react';
import { fetchUserProfile } from '@/lib/utils';
import { useMediaSources } from '@/hooks/useMediaSources';
import MediaConfiguration from '../MediaConfiguration';
import { ProfileState } from '@/types/user';

const Widget = () => {
  const [profile, setProfile] = useState<ProfileState>(null);
  const { user } = useUser();
  const { state, fetchMediaResources } = useMediaSources();

  useEffect(() => {
    if (user && user.id) {
      (async () => {
        try {
          const profile = await fetchUserProfile(user.id);
          setProfile(profile);
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      })();
    }
  }, [user]);

  useEffect(() => {
    if (user && user.id) {
      (async () => {
        try {
          await fetchMediaResources();
        } catch (error) {
          console.error('Error fetching media resources:', error);
        }
      })();
    }
  }, [user]);

  return (
    <div className="p-5">
      <ClerkLoading>
        <div className="h-full flex justify-center items-center">
          <Loader />
        </div>
      </ClerkLoading>
      <SignedIn>
        {profile && profile.user ? (
          <MediaConfiguration state={state} user={profile.user} />
        ) : (
          <div className="w-full h-full flex justify-center items-center">
            <Loader color="#fff" />
          </div>
        )}
      </SignedIn>
    </div>
  );
};

export default Widget;
