
import React from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { CheckIn } from '@/types/check-ins';
import CheckInDetails from './CheckInDetails';

interface CheckInModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  selectedCheckIn: CheckIn | null;
}

const CheckInModal: React.FC<CheckInModalProps> = ({ 
  isOpen, 
  setIsOpen, 
  selectedCheckIn 
}) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Check-In Details</DialogTitle>
            <DialogDescription>
              Detailed view of your emotional check-in
            </DialogDescription>
          </DialogHeader>
          <CheckInDetails checkIn={selectedCheckIn} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Check-In Details</DrawerTitle>
          <DrawerDescription>
            Detailed view of your emotional check-in
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4">
          <CheckInDetails checkIn={selectedCheckIn} />
        </div>
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default CheckInModal;
