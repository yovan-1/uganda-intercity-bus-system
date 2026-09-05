import React from 'react';
import { Seat } from '../types';
import { ShieldCheck, Info } from 'lucide-react';

interface BusSeatMapProps {
  seats: Seat[];
  selectedSeatIds: string[];
  onToggleSeat: (seat: Seat) => void;
  maxSeats: number;
}

export const BusSeatMap: React.FC<BusSeatMapProps> = ({
  seats: initialSeats,
  selectedSeatIds,
  onToggleSeat,
  maxSeats,
}) => {
  const seatsToUse = React.useMemo(() => {
    if (initialSeats && initialSeats.length > 0) return initialSeats;
    // Generate standard 36 seats (9 rows of 4: 1A, 1B, 1C, 1D ... 9D)
    const cols = ['A', 'B', 'C', 'D'];
    const generated: Seat[] = [];
    for (let r = 1; r <= 9; r++) {
      for (let c = 1; c <= 4; c++) {
        const seatNum = `${r}${cols[c - 1]}`;
        generated.push({
          id: `seat-${r}-${c}`,
          vehicleId: 'v-default',
          seatNumber: seatNum,
          seatRow: r,
          seatCol: c,
          isAccessible: false,
          isAvailable: !(r === 1 && c === 2) && !(r === 3 && c === 3),
        });
      }
    }
    return generated;
  }, [initialSeats]);

  // Sort seats by row and column
  const sortedSeats = [...seatsToUse].sort((a, b) => {
    if (a.seatRow !== b.seatRow) return a.seatRow - b.seatRow;
    return a.seatCol - b.seatCol;
  });

  // Group seats by row (typically 9 rows for 36 seats)
  const rows: Record<number, Seat[]> = {};
  sortedSeats.forEach((seat) => {
    if (!rows[seat.seatRow]) rows[seat.seatRow] = [];
    rows[seat.seatRow].push(seat);
  });

  return (
    <div className="bg-slate-50 border border-slate-300 rounded-2xl sm:rounded-3xl p-3 sm:p-6 relative max-w-2xl mx-auto shadow-sm space-y-6 w-full text-slate-800">
      {/* Bus Front / Driver Cabin Header */}
      <div className="border-b border-slate-300 pb-3 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-600 max-w-md mx-auto px-2">
          <div className="flex items-center gap-1.5">
            <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-extrabold text-[10px]">
              D
            </span>
            <span>DRIVER CABIN</span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-blue-800 font-semibold bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
            <ShieldCheck className="w-3.5 h-3.5" /> FRONT ENTRANCE
          </div>
        </div>
      </div>

      {/* Seat Layout Grid (2 Seats - AISLE - 2 Seats) with inner scrollbar if needed on ultra-narrow phones */}
      <div className="overflow-x-auto bus-grid-scrollbar py-2 w-full">
        <div className="min-w-[280px] max-w-md mx-auto space-y-3 px-1">
          {Object.entries(rows).map(([rowNum, rowSeats]) => {
            const rIdx = parseInt(rowNum, 10);
            const leftSeats = rowSeats.slice(0, 2);
            const rightSeats = rowSeats.slice(2, 4);

            return (
              <div key={rIdx} className="flex items-center justify-between gap-3 sm:gap-6 w-full">
                {/* Left Pair (A & B) */}
                <div className="flex items-center gap-2">
                  {leftSeats.map((seat) => {
                    const isSelected = selectedSeatIds.includes(seat.id);
                    const isOccupied = seat.isAvailable === false || (seat as any).isOccupied === true;

                    return (
                      <button
                        key={seat.id}
                        type="button"
                        disabled={isOccupied}
                        onClick={() => onToggleSeat(seat)}
                        className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl text-xs font-mono font-bold transition-all relative flex items-center justify-center border shadow-xs ${
                          isOccupied
                            ? 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed opacity-80'
                            : isSelected
                            ? 'bg-emerald-600 text-white border-emerald-700 ring-2 ring-emerald-500 shadow-md scale-105'
                            : 'bg-blue-700 text-white border-blue-800 hover:bg-blue-800 shadow-sm cursor-pointer'
                        }`}
                        title={`Seat ${seat.seatNumber} ${isOccupied ? '(Booked)' : '(Available)'}`}
                      >
                        {seat.seatNumber}
                      </button>
                    );
                  })}
                </div>

                {/* Center Aisle Indicator */}
                <div className="text-[10px] font-mono text-slate-500 font-semibold uppercase tracking-wider select-none px-1">
                  AISLE
                </div>

                {/* Right Pair (C & D) */}
                <div className="flex items-center gap-2">
                  {rightSeats.map((seat) => {
                    const isSelected = selectedSeatIds.includes(seat.id);
                    const isOccupied = seat.isAvailable === false || (seat as any).isOccupied === true;

                    return (
                      <button
                        key={seat.id}
                        type="button"
                        disabled={isOccupied}
                        onClick={() => onToggleSeat(seat)}
                        className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl text-xs font-mono font-bold transition-all relative flex items-center justify-center border shadow-xs ${
                          isOccupied
                            ? 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed opacity-80'
                            : isSelected
                            ? 'bg-emerald-600 text-white border-emerald-700 ring-2 ring-emerald-500 shadow-md scale-105'
                            : 'bg-blue-700 text-white border-blue-800 hover:bg-blue-800 shadow-sm cursor-pointer'
                        }`}
                        title={`Seat ${seat.seatNumber} ${isOccupied ? '(Booked)' : '(Available)'}`}
                      >
                        {seat.seatNumber}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bus Rear Footer */}
      <div className="border-t border-slate-300 pt-3 text-center">
        <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
          REAR ENGINE & EMERGENCY EXIT
        </span>
      </div>

      {/* Seat Status Legend */}
      <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-slate-700 font-normal">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-blue-700 border border-blue-800" />
          <span>Available</span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-emerald-600 border border-emerald-700" />
          <span className="font-medium text-slate-900">Your Selection (Book)</span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-slate-200 border border-slate-300" />
          <span className="text-slate-500">Already Booked</span>
        </div>
      </div>

      {selectedSeatIds.length >= maxSeats && (
        <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-normal flex items-center justify-center gap-1.5 font-mono">
          <Info className="w-4 h-4 text-blue-700 flex-shrink-0" />
          <span>Maximum {maxSeats} seat{maxSeats > 1 ? 's' : ''} selected for this booking.</span>
        </div>
      )}
    </div>
  );
};
