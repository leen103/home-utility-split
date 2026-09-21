import { useNavigate } from "@tanstack/react-router";
import { Repeat } from "lucide-react";
import { toast } from "sonner";
import { useMeterMate } from "@/lib/metermate/store";

export function RoleSwitch() {
  const { role, setRole } = useMeterMate();
  const navigate = useNavigate();

  const swap = () => {
    const next = role === "owner" ? "tenant" : "owner";
    setRole(next);
    toast.success(`สลับเป็นมุมมอง${next === "owner" ? "เจ้าของบ้าน" : "ผู้เช่า"}แล้ว`);
    void navigate({ to: next === "owner" ? "/owner" : "/tenant" });
  };

  return (
    <button
      onClick={swap}
      className="flex h-11 items-center gap-1 rounded-2xl border border-border bg-card px-3 text-xs font-semibold active:scale-95"
    >
      <Repeat className="h-4 w-4" />
      สลับบทบาท
    </button>
  );
}
