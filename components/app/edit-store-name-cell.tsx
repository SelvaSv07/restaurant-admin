"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Pencil, X } from "lucide-react";

import { updateStoreName } from "@/app/actions/stores";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Props = {
  storeId: string;
  displayName: string;
};

export function EditStoreNameCell({ storeId, displayName }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(displayName);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function cancel() {
    setValue(displayName);
    setError(null);
    setEditing(false);
  }

  async function save() {
    setError(null);
    setPending(true);
    try {
      const res = await updateStoreName(storeId, value);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setEditing(false);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  if (!editing) {
    return (
      <div className="flex min-w-0 items-center gap-2">
        <span className="min-w-0 truncate font-medium text-[#333]">{displayName}</span>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="shrink-0 text-[#858585] hover:text-[#333]"
          aria-label={`Edit name: ${displayName}`}
          onClick={() => {
            setValue(displayName);
            setError(null);
            setEditing(true);
          }}
        >
          <Pencil className="size-3.5" strokeWidth={2} />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-w-[12rem] flex-col gap-1.5 py-0.5">
      <div className="flex items-center gap-1.5">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          maxLength={120}
          disabled={pending}
          className={cn("h-9 flex-1 text-sm", error ? "border-destructive" : "")}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void save();
            }
            if (e.key === "Escape") cancel();
          }}
        />
        <Button
          type="button"
          size="icon-sm"
          variant="outline"
          className="shrink-0 text-[#ff6b1e]"
          disabled={pending}
          aria-label="Save name"
          onClick={() => void save()}
        >
          <Check className="size-3.5" strokeWidth={2.5} />
        </Button>
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          className="shrink-0"
          disabled={pending}
          aria-label="Cancel"
          onClick={cancel}
        >
          <X className="size-3.5" strokeWidth={2} />
        </Button>
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
