import { ConnectButton } from '@rainbow-me/rainbowkit';

const PINATA_JWT = process.env.PINATA_JWT;
console.log(PINATA_JWT);

function Page() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        padding: 12,
      }}
    >
      
      <ConnectButton />
    </div>
  );
}

export default Page;
