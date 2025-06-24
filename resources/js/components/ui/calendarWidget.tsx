import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

export default function CalendarWidget() {
  const [value, setValue] = useState(new Date());

  return (
    <div className="bg-white rounded shadow p-2 w-fit">
      <Calendar
        onChange={setValue}
        value={value}
        locale="id-ID"
      />
    </div>
  );
}


