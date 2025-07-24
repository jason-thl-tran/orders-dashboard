/**
 * Calendar displaying early and late order pickup dates
 */
import React from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';


export interface OrderCalendarProps {
  earlyDates: string[]; 
  lateDates: string[];  
}

export default function OrderCalendar({ earlyDates, lateDates }: OrderCalendarProps) {
  //Generate date objects whenever a new early or late date is provided
  const early = React.useMemo(
    () => earlyDates.map(date => {
      const d = new Date(date); return isNaN(d.getTime()) ? null : d;
    }).filter(Boolean) as Date[],
    [earlyDates]
  );
  const late = React.useMemo(
    () => lateDates.map(date => {
      const d = new Date(date); return isNaN(d.getTime()) ? null : d;
    }).filter(Boolean) as Date[],
    [lateDates]
  );

  //Highlight green for early, orange for late, both if both
  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return undefined;
    const isEarly = early.some(d => d.toDateString() === date.toDateString());
    const isLate = late.some(d => d.toDateString() === date.toDateString());
    if (isEarly && isLate) return 'highlight-both';
    if (isEarly) return 'highlight-early';
    if (isLate) return 'highlight-late';
    return undefined;
  };

  return (
    <Box>
      <Tooltip title="Green: Early Pickup, Orange: Late Pickup, Split: Both Early & Late">
        <Typography variant="h6" gutterBottom>
          Orders Due Calendar
        </Typography>
      </Tooltip>
      <Calendar tileClassName={tileClassName} />
      <style>{`
        .highlight-early {
          background: #43a047 !important;
          color: white !important;
          border-radius: 50%;
        }
        .highlight-late {
          background: #ff9800 !important;
          color: white !important;
          border-radius: 50%;
        }
        .highlight-both {
          background: linear-gradient(135deg, #43a047 50%, #ff9800 50%) !important;
          color: white !important;
          border-radius: 50%;
        }
        /* Fix react-calendar text color for dark backgrounds */
        .react-calendar__tile, .react-calendar__month-view, .react-calendar__month-view abbr {
          color: #222 !important;
        }
        .react-calendar__navigation button {
          color: #1976d2 !important;
        }
        .react-calendar {
          background: #fff !important;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
      `}</style>
    </Box>
  );
}
