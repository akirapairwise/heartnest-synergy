
import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import { ConflictStatus } from "@/types/conflicts";

export const getStatusInfo = (status: ConflictStatus) => {
  switch (status) {
    case 'resolved':
      return {
        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
        label: 'Resolved',
        bg: 'bg-green-50',
        border: 'border-green-100',
        text: 'text-green-700'
      };
    case 'pending_response':
      return {
        icon: <Clock className="h-5 w-5 text-amber-500" />,
        label: 'Awaiting Response',
        bg: 'bg-amber-50',
        border: 'border-amber-100',
        text: 'text-amber-700'
      };
    case 'pending_ai':
      return {
        icon: <Clock className="h-5 w-5 text-blue-500" />,
        label: 'Processing',
        bg: 'bg-blue-50',
        border: 'border-blue-100',
        text: 'text-blue-700'
      };
    case 'active':
      return {
        icon: <AlertCircle className="h-5 w-5 text-red-500" />,
        label: 'Active',
        bg: 'bg-red-50',
        border: 'border-red-100',
        text: 'text-red-700'
      };
    default:
      return {
        icon: <AlertCircle className="h-5 w-5 text-gray-500" />,
        label: 'Unknown',
        bg: 'bg-gray-50',
        border: 'border-gray-100',
        text: 'text-gray-700'
      };
  }
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString();
};
