'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      {...props}
    >
      <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865l8.875 11.633Z" />
    </svg>
  );


export function FollowMePopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const lastShown = localStorage.getItem('followPopupLastShown');
    const now = new Date().getTime();
    const oneDay = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    if (!lastShown || now - Number(lastShown) > oneDay) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 3000); // Show after 3 seconds

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('followPopupLastShown', new Date().getTime().toString());
  };
  
  const handleFollow = () => {
    handleClose();
    window.open('https://x.com/AbrahamNAVIG1', '_blank');
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
            <div className="flex justify-center mb-4">
                <XIcon className="h-10 w-10 text-foreground" />
            </div>
          <DialogTitle className="text-center text-2xl font-bold">Stay Updated!</DialogTitle>
          <DialogDescription className="text-center">
            Follow me on X for the latest updates, crypto insights, and announcements about CryptoQuest.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-col sm:space-x-0 gap-2">
           <Button onClick={handleFollow} size="lg">
             <XIcon className="h-5 w-5 mr-2"/>
            Follow on X
          </Button>
          <Button variant="ghost" onClick={handleClose}>Maybe Later</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
