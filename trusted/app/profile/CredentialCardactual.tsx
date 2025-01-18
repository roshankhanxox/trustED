// import { motion } from 'framer-motion'

// interface CredentialCardProps {
//   credential: {
//     tokenId: string
//     title?: string
//     image?: string
//     owner?: {
//       name?: string
//     }
//     issuer?: {
//       name?: string
//     }
//     timestamp?: string
//   }
// }

// export default function CredentialCard({ credential }: CredentialCardProps) {
//   const pinataBaseURL = 'https://tomato-defensive-ape-989.mypinata.cloud/ipfs/'
//   const imageUrl = credential.image?.replace('ipfs://', pinataBaseURL) || "/placeholder.svg"

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.5 }}
//       className="bg-gray-800 rounded-lg overflow-hidden shadow-lg"
//     >
//       <div className="relative h-48">
//         <img
//           src={imageUrl || "/placeholder.svg"}
//           alt={credential.title || "Untitled Credential"}
//           className="absolute inset-0 w-full h-full object-cover"
//           onError={(e) => {
//             e.currentTarget.src = "/placeholder.svg"
//           }}
//         />
//         <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
//         <h3 className="absolute bottom-4 left-4 text-white text-xl font-bold">
//           {credential.title || "Untitled Credential"}
//         </h3>
//       </div>
//       <div className="p-4">
//         <p className="text-gray-300 mb-2">
//           <span className="font-semibold">Owner:</span> {credential.owner?.name || "Unknown"}
//         </p>
//         <p className="text-gray-300 mb-2">
//           <span className="font-semibold">Issuer:</span> {credential.issuer?.name || "Unknown"}
//         </p>
//         <p className="text-gray-300 text-sm">
//           Issued on: {credential.timestamp ? new Date(credential.timestamp).toLocaleDateString() : "Unknown"}
//         </p>
//       </div>
//     </motion.div>
//   )
// }
import { motion } from 'framer-motion'
import Image from 'next/image'

interface CredentialCardProps {
  credential: {
    tokenId: string
    title?: string
    image?: string
    owner?: {
      name?: string
    }
    issuer?: {
      name?: string
    }
    timestamp?: string
  }
}

export default function CredentialCard({ credential }: CredentialCardProps) {
  const pinataBaseURL = 'https://tomato-defensive-ape-989.mypinata.cloud/ipfs/'
  const imageUrl = credential.image?.replace('ipfs://', pinataBaseURL) || "/placeholder.svg"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-800 rounded-lg overflow-hidden shadow-lg flex flex-col h-full"
    >
      <div className="relative pt-[75%] sm:pt-[66.67%] md:pt-[56.25%] lg:pt-[75%] xl:pt-[56.25%]">
        <Image
          src={imageUrl || "/placeholder.svg"}
          alt={credential.title || "Untitled Credential"}
          layout="fill"
          objectFit="cover"
          className="absolute inset-0"
          onError={(e) => {
            // @ts-ignore
            e.target.src = "/placeholder.svg"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
        <h3 className="absolute bottom-4 left-4 text-white text-xl font-bold line-clamp-2">
          {credential.title || "Untitled Credential"}
        </h3>
      </div>
      <div className="p-4 flex-grow flex flex-col justify-between">
        <div>
          <p className="text-gray-300 mb-2">
            <span className="font-semibold">Owner:</span> {credential.owner?.name || "Unknown"}
          </p>
          <p className="text-gray-300 mb-2">
            <span className="font-semibold">Issuer:</span> {credential.issuer?.name || "Unknown"}
          </p>
        </div>
        <p className="text-gray-300 text-sm mt-auto">
          Issued on: {credential.timestamp ? new Date(credential.timestamp).toLocaleDateString() : "Unknown"}
        </p>
      </div>
    </motion.div>
  )
}


