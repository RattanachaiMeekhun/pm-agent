import type { Metadata } from "next";
import "./globals.css"; // Commented out to prioritize Ant Design
import ThemeProvider from "@/providers/ThemeProvider";
import { StoreProvider } from "@/providers/StoreProvider";

export const metadata: Metadata = {
  title: "PM Agent",
  description: "Project Manager Agent",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        <StoreProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
