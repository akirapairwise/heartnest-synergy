
import { format } from 'date-fns';

export const getDateDisplay = (date: Date, time?: string) => {
  const now = new Date();
  const timeDiff = Math.ceil((date.getTime() - now.getTime()) / (1000 * 3600 * 24));
  
  const dateText = timeDiff === 0 ? "Today" : 
                  timeDiff === 1 ? "Tomorrow" : 
                  timeDiff > 0 ? `In ${timeDiff} days` : 
                  format(date, 'PPP');
                  
  return time ? `${dateText} at ${time}` : dateText;
};
