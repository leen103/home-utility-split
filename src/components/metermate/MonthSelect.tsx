import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMeterMate } from "@/lib/metermate/store";

export function MonthSelect() {
  const { months, activeMonthId, setActiveMonthId } = useMeterMate();
  return (
    <Select value={activeMonthId} onValueChange={setActiveMonthId}>
      <SelectTrigger className="h-12 rounded-2xl">
        <SelectValue placeholder="เลือกเดือน" />
      </SelectTrigger>
      <SelectContent>
        {months.map((m) => (
          <SelectItem key={m.id} value={m.id} className="min-h-11">
            {m.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
