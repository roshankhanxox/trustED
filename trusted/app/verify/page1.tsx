"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Loader2, Shield, Lock, User, FileText, Key, Search } from "lucide-react";
import { useReadContract, useWriteContract } from "wagmi";
import { keccak256, toBytes } from "viem";
import {
  CredentialNFTAddress,
  credentialNFTAbi,
  credentialVerifierAbi,
  CredentialVerifierAddress,
} from "@/app/abi";
import { readContract } from '@wagmi/core';
import { config } from "../wagmi";

let metadata:any;
let imageurl:string;

export default function CredentialVerifier() {
  const [tokenId, setTokenId] = useState("");
  const [title, setTitle] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [issuer, setIssuer] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [verificationResult, setVerificationResult] = useState<string | null>(null);

  const fetchTokenURI = async (tokenId: string) => {
    try {
      const tokenURI  = await readContract(config,{
        address: CredentialNFTAddress,
        abi: credentialNFTAbi,
        functionName: "tokenURI",
        args: [tokenId],
      });
      return tokenURI;
    } catch (error) {
      console.error("Error fetching token URI:", error);
      throw new Error("Failed to fetch token URI.");
    }
  };

  const fetchMetadata = async (uri: string) => {
    try {

      const pinataBaseURL = "https://tomato-defensive-ape-989.mypinata.cloud/ipfs/";
      const formattedURI = uri.replace("ipfs://", pinataBaseURL);

      const response = await fetch(formattedURI);

      if (!response.ok) {
        throw new Error("Failed to fetch metadata.");
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching metadata:", error);
      throw new Error("Failed to fetch metadata.");
    }
  };

  const verifyCredential = async (tokenId: string, documentHash: string, issuer: string) => {
    try {
      const data  = await readContract(config,{
        address: CredentialVerifierAddress,
        abi: credentialVerifierAbi,
        functionName: "verifyCredential",
        args: [tokenId, documentHash, issuer],
      });
      console.log(data);
      return data;
    } catch (error) {
      console.error("Error verifying credential:", error);
      throw new Error("Verification failed.");
    }
  };

  const handleFetchDetails = async () => {
    if (!tokenId) return;
    setIsFetching(true);

    try {
      // Fetch the token URI from the NFT contract
      const tokenURI = await fetchTokenURI(tokenId);
      metadata = await fetchMetadata(tokenURI as string);
      console.log(metadata);

      // Extract and set metadata fields
      setTitle(metadata?.title || "");
      setOwnerName(metadata?.owner?.name || "");
      setDocumentId(metadata?.document_id || "");
      setIssuer(metadata?.issuer?.address || "");
      const pinataBaseURL = "https://tomato-defensive-ape-989.mypinata.cloud/ipfs/";
      imageurl = metadata?.image.replace("ipfs://", pinataBaseURL);

    } catch (error:any) {
      console.error(error.message);
    } finally {
      setIsFetching(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const documentHash = keccak256(toBytes(JSON.stringify({ title, ownerName, documentId })));
      const result = await verifyCredential(tokenId, documentHash, issuer);
      console.log(result);
      setVerificationResult(result ? "Credential is valid." : "Credential is invalid.");
    } catch (error) {
      setVerificationResult("Verification failed.");
    } finally {
      setIsLoading(false);
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
              Credential Verifier
            </h1>
            <p className="text-blue-100">Verify the authenticity of your digital credentials</p>
          </div>

          <form onSubmit={handleVerify} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="tokenId" className="block text-sm font-medium text-gray-300">
                  <Key className="w-4 h-4 mr-2 text-purple-400" />
                  Token ID
                </label>
                <div className="flex">
                  <input
                    type="text"
                    id="tokenId"
                    value={tokenId}
                    onChange={(e) => setTokenId(e.target.value)}
                    className="flex-grow px-4 py-2 rounded-l-md bg-gray-700 border border-gray-600 text-white focus:ring focus:ring-purple-500 transition duration-300"
                    required
                  />
                  <button
                    type="button"
                    onClick={handleFetchDetails}
                    disabled={isFetching}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-r-md transition duration-300"
                  >
                    {isFetching ? <Loader2 className="animate-spin h-5 w-5" /> : <Search className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Other input fields for metadata */}
              <div className="space-y-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-300">
                  <FileText className="w-4 h-4 mr-2 text-purple-400" />
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 text-white focus:ring focus:ring-purple-500 transition duration-300"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-300">
                  <FileText className="w-4 h-4 mr-2 text-purple-400" />
                  issuer
                </label>
                <input
                  type="text"
                  id="issuer"
                  value={issuer}
                  onChange={(e) => setIssuer(e.target.value)}
                  className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 text-white focus:ring focus:ring-purple-500 transition duration-300"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="ownerName" className="block text-sm font-medium text-gray-300 flex items-center">
                  <User className="w-4 h-4 mr-2 text-purple-400" />
                  Owner Name
                </label>
                <input
                  type="text"
                  id="ownerName"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 text-white focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-50 transition duration-300"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="documentId" className="block text-sm font-medium text-gray-300 flex items-center">
                  <Lock className="w-4 h-4 mr-2 text-purple-400" />
                  Document ID
                </label>
                <input
                  type="text"
                  id="documentId"
                  value={documentId}
                  onChange={(e) => setDocumentId(e.target.value)}
                  className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 text-white focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-50 transition duration-300"
                  required
                />
              </div>
              {/* Additional inputs */}
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" /> : <CheckCircle className="w-6 h-6 mr-2" />}
              {isLoading ? "Verifying..." : "Verify Credential"}
            </button>
          </form>

          {verificationResult && (
            <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="p-8 bg-gray-900 border-t border-gray-700"
          >
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
              <Shield className="w-8 h-8 mr-3 text-green-400" />
              Verified Credential
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-purple-400 text-sm font-semibold">Document ID</p>
                  <p className="text-white font-medium">{metadata?.document_id || ""}</p>
                </div>
                <div>
                  <p className="text-purple-400 text-sm font-semibold">Title</p>
                  <p className="text-white font-medium">{metadata?.title}</p>
                </div>
                <div>
                  <p className="text-purple-400 text-sm font-semibold">Owner Name</p>
                  <p className="text-white font-medium">{metadata?.owner?.name}</p>
                </div>
                <div>
                  <p className="text-purple-400 text-sm font-semibold">Owner Wallet</p>
                  <p className="text-white font-medium">{metadata?.owner?.wallet_address}</p>
                </div>
                <div>
                  <p className="text-purple-400 text-sm font-semibold">Issuer</p>
                  <p className="text-white font-medium">{metadata?.issuer?.name}</p>
                </div>
                <div>
                  <p className="text-purple-400 text-sm font-semibold">Timestamp</p>
                  <p className="text-white font-medium">{new Date(metadata?.timestamp).toLocaleString()}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-purple-400 text-sm font-semibold">Description</p>
                  <p className="text-white">{metadata?.description}</p>
                </div>
                <div>
                  <p className="text-purple-400 text-sm font-semibold mb-2">Preview Image</p>
                  <img src={imageurl} alt="Credential Preview" className="w-full h-auto rounded-lg border border-gray-700 shadow-lg" />
                </div>
              </div>
            </div>
          </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
