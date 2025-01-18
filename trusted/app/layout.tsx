// import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
// import "./globals.css";

// import '@rainbow-me/rainbowkit/styles.css';
// import { Providers } from './providers';

// function RootLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <html lang="en">
//       <body>
//         <Providers>{children}</Providers>
//       </body>
//     </html>
//   );
// }

// export default RootLayout;
import { Navbar } from '../components/Navbar';
import { Providers } from './providers';
import "./globals.css";
import '@rainbow-me/rainbowkit/styles.css';

function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}

export default RootLayout;

