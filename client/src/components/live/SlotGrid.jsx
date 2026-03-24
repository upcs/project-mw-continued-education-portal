const days = [
  "Mon 14/08",
  "Tue 15/08",
  "Wed 16/08",
  "Thu 17/08",
  "Fri 18/08",
  "Sat 19/08",
  "Sun 20/08",
];

const times = [
  "8:00 AM",
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
];

const slots = [
  { id: 1, col: 1, top: 80, height: 140, text: ["9:00am - 10:45am"] },
  { id: 2, col: 2, top: 6, height: 64, text: ["8:00am - 8:45am"] },
  { id: 3, col: 4, top: 6, height: 64, text: ["2 seats left", "8:00am - 8:45am"] },
  { id: 4, col: 3, top: 148, height: 142, text: ["10:00am - 11:45am"] },
  { id: 5, col: 4, top: 148, height: 64, text: ["10:00am - 10:45am"] },
  { id: 6, col: 5, top: 148, height: 64, text: ["9 seats left", "10:15am - 10:45am"] },
  { id: 7, col: 4, top: 222, height: 64, text: ["11:00am - 11:45am"] },
];

export default function SlotGrid() {
  return (
    <div className="slot-grid">
      <div className="slot-grid__days">
        <div className="slot-grid__time-gap" />

        {days.map((day, index) => (
          <div
            key={day}
            className={`slot-grid__day ${index === 3 ? "slot-grid__day--active" : ""}`}
          >
            {day}
          </div>
        ))}
      </div>

      <div className="slot-grid__body">
        <div className="slot-grid__times">
          {times.map((time) => (
            <div className="slot-grid__time" key={time}>
              {time}
            </div>
          ))}
        </div>

        <div className="slot-grid__board">
          <div className="slot-grid__today-col" />

          {[0, 1, 2, 3, 4, 5].map((row) => (
            <div
              key={row}
              className="slot-grid__h-line"
              style={{ top: `${row * 74}px` }}
            />
          ))}

          {slots.map((slot) => (
            <div
              key={slot.id}
              className="slot-grid__slot"
              style={{
                left: `calc(${((slot.col - 1) / 7) * 100}% + 10px)`,
                top: `${slot.top}px`,
                width: `calc(${100 / 7}% - 20px)`,
                height: `${slot.height}px`,
              }}
            >
              {slot.text.map((line) => (
                <div key={line}>{line}</div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}