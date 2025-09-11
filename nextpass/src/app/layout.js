// src/app/layout.js
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext"; // Import the provider

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "NextPass",
  description: "Seamless Event Management",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* This makes the auth state available everywhere */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}