// import { ConnectButton } from '@rainbow-me/rainbowkit';
// import Link from 'next/link';

// export function Navbar() {
//   return (
//     <nav className="flex justify-between items-center p-4 bg-gray-100">
//       <div className="flex items-center space-x-4">
//         <Link href="/" className="text-lg font-bold">
//           My dApp
//         </Link>
//         <Link href="/about" className="hover:underline">
//           About
//         </Link>
//         <Link href="/dashboard" className="hover:underline">
//           Dashboard
//         </Link>
//       </div>
//       <ConnectButton />
//     </nav>
//   );
// }
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { Shield } from 'lucide-react';
import '@rainbow-me/rainbowkit/styles.css';

export function Navbar() {
  return (
    <nav className="bg-gray-900 border-b border-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-xl font-bold text-white flex items-center">
            <Shield className="w-6 h-6 mr-2 text-purple-400" />
            <span className="bg-gradient-to-r from-purple-400 to-blue-500 text-transparent bg-clip-text">
              Cred Verify
            </span>
          </Link>
          <Link href="/about" className="text-gray-300 hover:text-white transition duration-300">
            About
          </Link>
          <Link href="/dashboard" className="text-gray-300 hover:text-white transition duration-300">
            Dashboard
          </Link>
        </div>
        <ConnectButton />
      </div>
    </nav>
  );
}



