"use client";

import { useState } from "react";
import { PasswordGate } from "@/components/admin/PasswordGate";
import { AdminForm } from "@/components/admin/AdminForm";
import { DonorList } from "@/components/admin/DonorList";
import { CelebrationButton } from "@/components/admin/CelebrationButton";

export default function AdminPage() {
  return (
    <PasswordGate>
      {(password) => <AdminInner password={password} />}
    </PasswordGate>
  );
}

function AdminInner({ password }: { password: string }) {
  const [refreshKey, setRefreshKey] = useState<number>(0);

  return (
    <main className="min-h-screen bg-stone-950 px-4 sm:px-8 py-8">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <header className="flex items-baseline justify-between">
          <div className="font-serif text-2xl">
            <span className="text-stone-100">Support </span>
            <span className="text-amber-400">CNDA</span>
          </div>
          <div className="font-sans text-xs uppercase tracking-[0.4em] text-amber-400">
            Admin
          </div>
        </header>

        <AdminForm
          password={password}
          onAdded={() => setRefreshKey((k) => k + 1)}
        />

        <CelebrationButton password={password} />

        <section className="flex flex-col gap-3">
          <DonorList password={password} refreshKey={refreshKey} />
        </section>
      </div>
    </main>
  );
}
