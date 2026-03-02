import type { Metadata } from "next";
import "./globals.css"; // Commented out to prioritize Ant Design
import ThemeProvider from "@/providers/ThemeProvider";
import { StoreProvider } from "@/providers/StoreProvider";
import AuthInitializer from "@/components/auth/AuthInitializer";

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
          <AuthInitializer>
            <ThemeProvider>{children}</ThemeProvider>
          </AuthInitializer>
        </StoreProvider>
      </body>
    </html>
  );
}
