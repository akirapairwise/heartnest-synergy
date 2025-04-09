
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckIn } from '@/types/check-ins';
import CheckInForm from '@/components/check-ins/CheckInForm';
import CheckInCalendar from '@/components/check-ins/CheckInCalendar';
import CheckInsByDate from '@/components/check-ins/CheckInsByDate';
import RecentCheckIns from '@/components/check-ins/RecentCheckIns';
import CheckInModal from '@/components/check-ins/CheckInModal';

const CheckInsPage = () => {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedCheckIn, setSelectedCheckIn] = useState<CheckIn | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchCheckIns();
    }
  }, [user]);

  const fetchCheckIns = async () => {
    try {
      // Use a more generic approach to work around TypeScript limitations
      const { data, error } = await supabase
        .from('check_ins')
        .select('*')
        .order('timestamp', { ascending: false }) as { data: CheckIn[] | null, error: any };

      if (error) {
        throw error;
      }

      setCheckIns(data || []);
    } catch (error) {
      console.error('Error fetching check-ins:', error);
      toast.error('Failed to load check-ins');
    }
  };

  const handleViewCheckIn = (checkIn: CheckIn) => {
    setSelectedCheckIn(checkIn);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Emotional Check-Ins</h1>
        <p className="text-muted-foreground">Track and reflect on your emotional well-being</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <CheckInForm onCheckInSaved={fetchCheckIns} />
        </div>
        
        <div className="md:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CheckInCalendar 
              checkIns={checkIns}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
            />
            
            <CheckInsByDate 
              selectedDate={selectedDate}
              checkIns={checkIns}
              onViewCheckIn={handleViewCheckIn}
            />
          </div>
          
          <RecentCheckIns 
            checkIns={checkIns}
            onViewCheckIn={handleViewCheckIn}
          />
        </div>
      </div>
      
      <CheckInModal 
        isOpen={isDetailModalOpen}
        setIsOpen={setIsDetailModalOpen}
        selectedCheckIn={selectedCheckIn}
      />
    </div>
  );
};

export default CheckInsPage;
