
import React from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { CheckIn } from '@/types/check-ins';
import CheckInDetails from './CheckInDetails';

interface CheckInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCheckIn?: CheckIn | null;
}

const CheckInModal: React.FC<CheckInModalProps> = ({ 
  open, 
  onOpenChange, 
  selectedCheckIn = null
}) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Check-In Details</DialogTitle>
            <DialogDescription>
              Detailed view of your emotional check-in
            </DialogDescription>
          </DialogHeader>
          <CheckInDetails checkIn={selectedCheckIn} />
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
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
