import { Button } from '@/components/ui/button';
import { SignedOut, SignInButton, SignUpButton } from '@clerk/clerk-react';

const AuthButton = () => {
  return (
    <SignedOut>
      <div className='flex gap-x-3 justify-center items-center bg-[#171717]'>
        <SignInButton>
          <Button
            variant='outline'
            className='px-10 rounded-full border-white text-white hover:bg-white hover:text-black transition-colors'
          >
            Sign In
          </Button>
        </SignInButton>
        <SignUpButton>
          <Button 
            variant='outline'  
            className='px-10 rounded-full border-white text-white hover:bg-white hover:text-black transition-colors'
          >
            Sign Up
          </Button>
        </SignUpButton>
      </div>
    </SignedOut>
  );
};

export default AuthButton;