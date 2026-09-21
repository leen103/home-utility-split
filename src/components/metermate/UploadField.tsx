import { Camera, ImageIcon, X } from "lucide-react";
import { useRef } from "react";
import { readFileAsDataUrl } from "@/lib/metermate/store";

export interface PickedFile {
  name: string;
  dataUrl: string;
}

export function UploadField({
  value,
  onChange,
  label,
  hint,
}: {
  value: PickedFile | null;
  onChange: (f: PickedFile | null) => void;
  label: string;
  hint?: string;
}) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const handle = async (file: File | undefined) => {
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    onChange({ name: file.name, dataUrl });
  };

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-semibold">{label}</p>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </div>

      {value ? (
        <div className="overflow-hidden rounded-[20px] border border-border bg-card">
          <img
            src={value.dataUrl}
            alt={value.name}
            className="h-44 w-full bg-muted object-cover"
          />
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-3 py-2">
            <p className="truncate text-xs text-muted-foreground">{value.name}</p>
            <button
              onClick={() => onChange(null)}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border text-destructive"
              aria-label="ลบรูป"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => cameraRef.current?.click()}
            className="flex min-h-[96px] flex-col items-center justify-center gap-2 rounded-[20px] border-2 border-dashed border-primary/40 bg-primary/5 text-sm font-semibold text-primary active:scale-95"
          >
            <Camera className="h-6 w-6" />
            ถ่ายรูป
          </button>
          <button
            onClick={() => galleryRef.current?.click()}
            className="flex min-h-[96px] flex-col items-center justify-center gap-2 rounded-[20px] border-2 border-dashed border-border bg-card text-sm font-semibold text-foreground active:scale-95"
          >
            <ImageIcon className="h-6 w-6" />
            เลือกรูป
          </button>
        </div>
      )}

      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => void handle(e.target.files?.[0])}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => void handle(e.target.files?.[0])}
      />
    </div>
  );
}
