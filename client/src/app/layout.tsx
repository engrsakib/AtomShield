


import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Script from "next/script";




const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"], 
  variable: "--font-poppins",
});


export const metadata: Metadata = {
  title: "EduMaster Management",
  description: "Create EduMaster Dashboard App",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
     
        <Script
          src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"
          strategy="afterInteractive"
        />





    
      <body
        className={`${poppins.variable} font-poppins antialiased bg-gray-50 text-gray-800`}
      >
        {children}
      </body>
      
    </html>
  );
}






