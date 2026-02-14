import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "var(--bg-main)",
          marginLeft: 260,
        }}
      >
        {children}
      </main>
    </div>
  );
}
