import { CreateStoreForm } from "@/components/app/create-store-form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { listStores } from "@/lib/queries/stores";

export default async function SettingsPage() {
  const stores = await listStores();

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-[#333]">Settings</h1>
        <p className="mt-1 text-sm text-[#858585]">
          Manage stores and POS sync credentials. Each POS sends data to{" "}
          <code className="rounded bg-[#f7f7f7] px-1 py-0.5 text-xs ring-1 ring-[#ebebeb]">POST /api/ingest/v1</code>{" "}
          with its store id and secret.
        </p>
      </header>

      <CreateStoreForm />

      <div className="overflow-hidden rounded-xl bg-white shadow-[0_4px_24px_rgba(51,51,51,0.06)] ring-1 ring-[#ebebeb]">
        <div className="border-b border-[#ebebeb] px-4 py-3">
          <p className="text-sm font-semibold text-[#333]">Stores</p>
          <p className="text-xs text-[#858585]">Use the store id when configuring each restaurant&apos;s POS.</p>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Store id</TableHead>
              <TableHead className="text-right">Last sync</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stores.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium text-[#333]">{s.displayName}</TableCell>
                <TableCell className="text-[#858585]">{s.slug}</TableCell>
                <TableCell className="font-mono text-xs text-[#333]">{s.id}</TableCell>
                <TableCell className="text-right text-[#858585]">
                  {s.lastSyncAt ? s.lastSyncAt.toLocaleString("en-IN") : "—"}
                </TableCell>
              </TableRow>
            ))}
            {stores.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-[#858585]">
                  No stores yet — create one above.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
