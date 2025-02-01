import { cn, onCloseApp } from '@/lib/utils';
import { UserButton } from '@clerk/clerk-react';
import { XIcon } from 'lucide-react';
import React, { useState } from 'react';

type Props = {
  children: React.ReactNode;
  className?: string;
};

const ControlLayout = ({ children, className }: Props) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  window.ipcRenderer.on('hide-plugin', (event, payload) => {
    console.log(event);
    setIsVisible(payload.state);
  });

  return (
    <div
      className={cn(
        className,
        isVisible && 'invisible',
        'bg-[#171717] flex flex-col px-1 rounded-3xl overflow-hidden'
      )}
    >
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center p-5 draggable">
        <span className="non-draggable">
          <UserButton />
        </span>
        <XIcon
          size={20}
          className="text-gray-400 non-draggable cursor-pointer hover:text-white"
          onClick={onCloseApp}
        />
      </div>
      {/* CONTENT SECTION */}
      <div className="flex-1 h-0 overflow-auto">{children}</div>
      {/* FOOTER SECTION */}
      <div className="p-5 flex w-full">
        <div className="flex items-center gap-x-2">
          <img src="/logo.svg" alt="video sharing Logo" className="w-30 h-20" />
          <p className="text-white text-2xl">Video Sharing</p>
        </div>
      </div>
    </div>
  );
};

export default ControlLayout;

/*

┌─────────────────────────────────────────┐
│     [User Button]            [X Close]  │  <- Draggable Header
├─────────────────────────────────────────┤
│                                         │
│                                         │
│           Content Area                  │  <- Scrollable Area
│     (Whatever children are passed)      │
│                                         │
│                                         │
├─────────────────────────────────────────┤
│  [Opal Logo]  Opal                      │  <- Footer
└─────────────────────────────────────────┘


*/
