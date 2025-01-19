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
              TrustED
            </span>
          </Link>
          <Link href="/issue" className="text-gray-300 hover:text-white transition duration-300">
            Issue
          </Link>
          <Link href="/verify" className="text-gray-300 hover:text-white transition duration-300">
            Verify
          </Link>
          <Link href="/profile" className="text-gray-300 hover:text-white transition duration-300">
            Profile
          </Link>
          <Link href="/leaderboards" className="text-gray-300 hover:text-white transition duration-300">
            Leaderboards
          </Link>
        </div>
        <ConnectButton />
      </div>
    </nav>
  );
}



