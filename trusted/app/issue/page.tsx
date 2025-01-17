// "use client";

// import { useState } from "react";
// import { motion } from "framer-motion";
// import { Shield, Upload, CheckCircle,MessageCircle} from 'lucide-react';
// import { useAccount, useSignMessage, useWriteContract } from "wagmi";
// import { waitForTransactionReceipt } from "@wagmi/core";
// import { keccak256, toBytes } from 'viem';
// import { CredentialNFTAddress, credentialNFTAbi } from "@/app/abi";
// import { config } from "../wagmi";
// import { GeminiChatModal } from "@/components/GeminiChatModal";


// const NEXT_PUBLIC_PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT || undefined;


// let metadataHash:any;let imageHash

// export default function IssueCredential() {
//   const { address, isConnected } = useAccount();
//   const [isLoading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
  
//   // Form states
//   const [documentId, setDocumentId] = useState('');
//   const [title, setTitle] = useState('');
//   const [description, setDescription] = useState('');
//   const [ownerName, setOwnerName] = useState('');
//   const [ownerWalletAddress, setOwnerWalletAddress] = useState('');
//   const [issuerName, setIssuerName] = useState('');
//   const [imageFile, setImageFile] = useState(null);
//   const [imagePreview, setImagePreview] = useState('');
  
//   // IPFS states
//   const [imageIpfsHash, setImageIpfsHash] = useState('');
//   const [metadataIpfsHash, setMetadataIpfsHash] = useState('');
//   const [isChatModalOpen, setIsChatModalOpen] = useState(false);
//   const { writeContractAsync } = useWriteContract();

// //   const { signMessage } = useSignMessage({
// //     mutation: {onSuccess:async (signature) => {
// //       // handleMintCredential(signature)
// //       try {
// //         console.log("signature received:",signature);
// //         await handleMintCredential(signature);
// //         console.log("minting completed successfully");
// //       } catch (error:any){
// //         console.error("error in handlemintcredential",error);
// //         setError("Failed to mint credential: " + error.message);
// //       }
// //     }}
// // });

//   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       setImageFile(file as any);
//       const previewUrl = URL.createObjectURL(file);
//       setImagePreview(previewUrl);
//     }
//   };

//   // Upload image to Pinata
//   const uploadImageToPinata = async (file: any) => {
//     try {
//       const data = new FormData();
//       data.append("file", file);

//       const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${NEXT_PUBLIC_PINATA_JWT as string}`,
//         },
//         body: data,
//       });
//       const res = await response.json()
//       console.log("image",res);
//       return res;
//     } catch (error) {
//       console.error("Error uploading to IPFS:", error);
//       return null;
//     }
//   };

//   // Upload metadata to Pinata
//   const uploadMetadataToPinata = async (metadata: object) => {
//     try {
//       const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
//         method: "POST",
//         headers: {
//             Authorization: `Bearer ${NEXT_PUBLIC_PINATA_JWT as string}`,
//             "Content-Type": "application/json",
//           },
//         body: JSON.stringify(metadata),
//       });

//       console.log(JSON.stringify(metadata));
//       const res = await response.json()
//       console.log("metadata",res);
//       return res;
//     } catch (error) {
//       console.error("Error pinning metadata to IPFS:", error);
//       return null;
//     }
//   };

//   // Mint credential
//   const handleMintCredential = async () => {
//     try {
//       const documentHash = keccak256(toBytes(JSON.stringify({ title, ownerName, documentId })));
//       const args = [
//         ownerWalletAddress,
//         documentHash,
//         `ipfs://${metadataHash}`,
//       ];
//       console.log(args);

//       const receipt = await writeContractAsync({
//         address: CredentialNFTAddress,
//         abi: credentialNFTAbi,
//         functionName: "mintCredential",
//         args,
//       });

//       const txt = await waitForTransactionReceipt(config, { hash: receipt });
//       console.log(txt);
//       setSuccess("Credential minted successfully!");
//     } catch (error: any) {
//       setError("Failed to mint credential: " + error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Form submission
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!isConnected) {
//       setError("Please connect your wallet first");
//       return;
//     }

//     setLoading(true);
//     setError('');
//     setSuccess('');

//     try {
//       if (!imageFile) throw new Error("Please select an image");
//       const imageHashResponse = await uploadImageToPinata(imageFile);
//       imageHash = imageHashResponse?.IpfsHash;
//       setImageIpfsHash(imageHash);

//       console.log(imageHash);

//       const metadata = {
//         document_id: documentId,
//         title,
//         description,
//         image: `ipfs://${imageHash}`,
//         owner: { name: ownerName, wallet_address: ownerWalletAddress },
//         issuer: { name: issuerName },
//         timestamp: new Date().toISOString(),
//       };

//       const metadataHashResponse = await uploadMetadataToPinata(metadata);
//       metadataHash = metadataHashResponse?.IpfsHash;
//       setMetadataIpfsHash(metadataHash);

//       console.log(metadataHash);

//       const signHash = keccak256(toBytes(JSON.stringify({ title, ownerName, documentId })));

//       handleMintCredential();
      
      
//     } catch (error: any) {
//       setError(error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//         className="w-full max-w-4xl"
//       >
//         <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl">
//           <div className="border-b border-gray-700 p-6">
//             <h2 className="text-3xl font-bold text-gray-100 flex items-center">
//               <Shield className="w-8 h-8 mr-2 text-blue-500" />
//               Issue New Credential
//             </h2>
//           </div>
//           <div className="p-6">
//             <form onSubmit={handleSubmit} className="space-y-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="space-y-2">
//                   <label htmlFor="documentId" className="text-gray-300 block">Document ID</label>
//                   <input
//                     id="documentId"
//                     value={documentId}
//                     onChange={(e) => setDocumentId(e.target.value)}
//                     required
//                     className="w-full bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <label htmlFor="title" className="text-gray-300 block">Title</label>
//                   <input
//                     id="title"
//                     value={title}
//                     onChange={(e) => setTitle(e.target.value)}
//                     required
//                     className="w-full bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   />
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <label htmlFor="description" className="text-gray-300 block">Description</label>
//                 <textarea
//                   id="description"
//                   value={description}
//                   onChange={(e) => setDescription(e.target.value)}
//                   required
//                   className="w-full bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32 resize-none"
//                 />
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="space-y-2">
//                   <label htmlFor="ownerName" className="text-gray-300 block">Owner Name</label>
//                   <input
//                     id="ownerName"
//                     value={ownerName}
//                     onChange={(e) => setOwnerName(e.target.value)}
//                     required
//                     className="w-full bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <label htmlFor="ownerWalletAddress" className="text-gray-300 block">Owner Wallet Address</label>
//                   <input
//                     id="ownerWalletAddress"
//                     value={ownerWalletAddress}
//                     onChange={(e) => setOwnerWalletAddress(e.target.value)}
//                     required
//                     className="w-full bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <label htmlFor="issuerName" className="text-gray-300 block">Issuer Name</label>
//                   <input
//                     id="issuerName"
//                     value={issuerName}
//                     onChange={(e) => setIssuerName(e.target.value)}
//                     required
//                     className="w-full bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   />
//                 </div>

//               </div>

//               <div className="space-y-2">
//                 <label htmlFor="image" className="text-gray-300 block">Credential Image</label>
//                 <div className="flex items-center justify-center w-full">
//                   <label
//                     htmlFor="image"
//                     className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-700 hover:bg-gray-600 transition-all duration-300"
//                   >
//                     <div className="flex flex-col items-center justify-center pt-5 pb-6">
//                       <Upload className="w-10 h-10 mb-3 text-gray-400" />
//                       <p className="mb-2 text-sm text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
//                       <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
//                     </div>
//                     <input
//                       id="image"
//                       type="file"
//                       accept="image/*"
//                       onChange={handleImageChange}
//                       required
//                       className="hidden"
//                     />
//                   </label>
//                 </div>
//                 {imagePreview && (
//                   <motion.img
//                     initial={{ opacity: 0, scale: 0.8 }}
//                     animate={{ opacity: 1, scale: 1 }}
//                     transition={{ duration: 0.3 }}
//                     src={imagePreview}
//                     alt="Preview"
//                     className="mt-4 max-w-full h-auto rounded-lg shadow-lg border-2 border-gray-600"
//                   />
//                 )}
//               </div>

//               <button
//                 type="submit"
//                 disabled={isLoading || !isConnected}
//                 className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {isLoading ? (
//                   <span className="flex items-center justify-center">
//                     <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                     </svg>
//                     Processing...
//                   </span>
//                 ) : (
//                   <span className="flex items-center justify-center">
//                     <CheckCircle className="w-5 h-5 mr-2" />
//                     Issue Credential
//                   </span>
//                 )}
//               </button>

//               {error && (
//                 <motion.div 
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   className="mt-4 p-4 text-red-100 bg-red-500 bg-opacity-20 border border-red-200 rounded-lg"
//                 >
//                   {error}
//                 </motion.div>
//               )}

//               {success && (
//                 <motion.div 
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   className="mt-4 p-4 text-green-100 bg-green-500 bg-opacity-20 border border-green-200 rounded-lg"
//                 >
//                   {success}
//                 </motion.div>
//               )}
//             </form>
//           </div>
//         </div>
//         <button
//           onClick={() => setIsChatModalOpen(true)}
//           className="fixed bottom-4 right-4 bg-blue-600 text-white rounded-full p-3 shadow-lg hover:bg-blue-700 transition-colors"
//         >
//           <MessageCircle size={24} />
//         </button>
//         <GeminiChatModal isOpen={isChatModalOpen} onClose={() => setIsChatModalOpen(false)} />
//       </motion.div>
//     </div>
//   );
// }
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Upload, CheckCircle, MessageCircle, Loader2 } from 'lucide-react';
import { useAccount, useSignMessage, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "@wagmi/core";
import { keccak256, toBytes } from 'viem';
import { CredentialNFTAddress, credentialNFTAbi } from "@/app/abi";
import { config } from "../wagmi";
import { GeminiChatModal } from "@/components/GeminiChatModal";

const NEXT_PUBLIC_PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT || undefined;

let metadataHash:any;
let imageHash:any;

export default function IssueCredential() {
  const { address, isConnected } = useAccount();
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form states
  const [documentId, setDocumentId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerWalletAddress, setOwnerWalletAddress] = useState('');
  const [issuerName, setIssuerName] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const { writeContractAsync } = useWriteContract();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file as any);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  // Upload image to Pinata
  const uploadImageToPinata = async (file: any) => {
    try {
      const data = new FormData();
      data.append("file", file);

      const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${NEXT_PUBLIC_PINATA_JWT as string}`,
        },
        body: data,
      });
      const res = await response.json()
      console.log("image",res);
      return res;
    } catch (error) {
      console.error("Error uploading to IPFS:", error);
      return null;
    }
  };

  // Upload metadata to Pinata
  const uploadMetadataToPinata = async (metadata: object) => {
    try {
      const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${NEXT_PUBLIC_PINATA_JWT as string}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(metadata),
      });

      const res = await response.json()
      console.log("metadata",res);
      return res;
    } catch (error) {
      console.error("Error pinning metadata to IPFS:", error);
      return null;
    }
  };

  // Mint credential
  const handleMintCredential = async () => {
    try {
      const documentHash = keccak256(toBytes(JSON.stringify({ title, ownerName, documentId })));
      const args = [
        ownerWalletAddress,
        documentHash,
        `ipfs://${metadataHash}`,
      ];
      console.log(args);

      const receipt = await writeContractAsync({
        address: CredentialNFTAddress,
        abi: credentialNFTAbi,
        functionName: "mintCredential",
        args,
      });

      const txt = await waitForTransactionReceipt(config, { hash: receipt });
      console.log(txt);
      setSuccess("Credential minted successfully!");
    } catch (error: any) {
      setError("Failed to mint credential: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
      setError("Please connect your wallet first");
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!imageFile) throw new Error("Please select an image");
      const imageHashResponse = await uploadImageToPinata(imageFile);
      imageHash = imageHashResponse?.IpfsHash;

      const metadata = {
        document_id: documentId,
        title,
        description,
        image: `ipfs://${imageHash}`,
        owner: { name: ownerName, wallet_address: ownerWalletAddress },
        issuer: { name: issuerName },
        timestamp: new Date().toISOString(),
      };

      const metadataHashResponse = await uploadMetadataToPinata(metadata);
      metadataHash = metadataHashResponse?.IpfsHash;

      handleMintCredential();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl"
      >
        <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-8 bg-gradient-to-r from-blue-600 to-purple-600">
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
              <Shield className="w-10 h-10 mr-3 text-yellow-300" />
              Issue New Credential
            </h1>
            <p className="text-blue-100">Create and mint a new verifiable credential</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="documentId" className="block text-sm font-medium text-gray-300">Document ID</label>
                <input
                  id="documentId"
                  value={documentId}
                  onChange={(e) => setDocumentId(e.target.value)}
                  required
                  className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 text-white focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-50 transition duration-300"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-300">Title</label>
                <input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 text-white focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-50 transition duration-300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-300">Description</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 text-white focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-50 transition duration-300 h-32 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="ownerName" className="block text-sm font-medium text-gray-300">Owner Name</label>
                <input
                  id="ownerName"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  required
                  className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 text-white focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-50 transition duration-300"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="ownerWalletAddress" className="block text-sm font-medium text-gray-300">Owner Wallet Address</label>
                <input
                  id="ownerWalletAddress"
                  value={ownerWalletAddress}
                  onChange={(e) => setOwnerWalletAddress(e.target.value)}
                  required
                  className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 text-white focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-50 transition duration-300"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="issuerName" className="block text-sm font-medium text-gray-300">Issuer Name</label>
                <input
                  id="issuerName"
                  value={issuerName}
                  onChange={(e) => setIssuerName(e.target.value)}
                  required
                  className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 text-white focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-50 transition duration-300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Credential Image</label>
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="image"
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-700 hover:bg-gray-600 transition-all duration-300"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-10 h-10 mb-3 text-purple-400" />
                    <p className="mb-2 text-sm text-gray-300"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-gray-400">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                  </div>
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    required
                    className="hidden"
                  />
                </label>
              </div>
              {imagePreview && (
                <motion.img
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  src={imagePreview}
                  alt="Preview"
                  className="mt-4 max-w-full h-auto rounded-lg shadow-lg border-2 border-gray-600"
                />
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !isConnected}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" />
                  Processing...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 mr-2" />
                  Issue Credential
                </span>
              )}
            </button>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-200"
              >
                {error}
              </motion.div>
            )}

            {success && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-200"
              >
                {success}
              </motion.div>
            )}
          </form>
        </div>

        <button
          onClick={() => setIsChatModalOpen(true)}
          className="fixed bottom-4 right-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full p-3 shadow-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
        >
          <MessageCircle size={24} />
        </button>
        <GeminiChatModal isOpen={isChatModalOpen} onClose={() => setIsChatModalOpen(false)} />
      </motion.div>
    </div>
  );
}

