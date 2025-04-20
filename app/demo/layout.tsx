'use client';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">  
      <div className="flex-1 flex flex-col">
        <main className="flex-1 overflow-hidden">
            <div
              className="h-full"
            >
              {children}
            </div>
        </main>
      </div>
    </div>
  );
}