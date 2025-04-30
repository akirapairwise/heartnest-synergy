
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
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-xl">Check-In Details</DialogTitle>
            <DialogDescription>
              Detailed view of your emotional check-in
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto pr-1">
            <CheckInDetails checkIn={selectedCheckIn} />
          </div>
          <DialogFooter className="mt-4 pt-2 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="text-left">
          <DrawerTitle className="text-lg">Check-In Details</DrawerTitle>
          <DrawerDescription>
            Detailed view of your emotional check-in
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 overflow-y-auto pb-16">
          <CheckInDetails checkIn={selectedCheckIn} />
        </div>
        <DrawerFooter className="pt-2 border-t">
          <DrawerClose asChild>
            <Button variant="outline" className="w-full">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default CheckInModal;
