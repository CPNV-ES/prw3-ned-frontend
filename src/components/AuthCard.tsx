import type { ReactNode } from "react";

type AuthCardProps = {
  title: string;
  children: ReactNode;
};

export default function AuthCard({ title, children }: AuthCardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="tech-surface-strong overflow-hidden">
          <div className="border-b border-slate-200 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-6 py-5 text-white">
            <div className="text-xs uppercase tracking-widest text-cyan-200/90">
              Demo Deck
            </div>
            <h1 className="mt-2 text-2xl font-bold">{title}</h1>
          </div>

          <div className="px-6 py-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
