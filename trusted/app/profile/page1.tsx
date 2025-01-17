"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Upload, CheckCircle, Loader2, User, FileText, Key, Camera } from 'lucide-react';
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "@wagmi/core";
import { SocialAbi, profileaddress } from "@/app/abi";
import { config } from "@/app/wagmi";

const NEXT_PUBLIC_PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT || undefined;

interface ProfileInfo {
  exists: boolean;
  tokenId: bigint;
  tokenURI: string;
}

export default function UserProfile() {
  const { address, isConnected } = useAccount();
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profileExists, setProfileExists] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  
  // Form states
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [funFact, setFunFact] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');

  const { data: profileInfo, isError, isLoading: isProfileLoading } = useReadContract({
    address: profileaddress,
    abi: SocialAbi,
    functionName: "getProfileInfo",
    args: [address],
  });

  useEffect(() => {
    if (!isProfileLoading && profileInfo) {
      const typedProfileInfo = profileInfo as ProfileInfo;
      setProfileExists(typedProfileInfo.exists);
      if (typedProfileInfo.exists && typedProfileInfo.tokenURI) {
        fetchProfileData(typedProfileInfo.tokenURI);
      }
    }
  }, [profileInfo, isProfileLoading]);

  const fetchProfileData = async (uri: string) => {
    if (!uri) {
      console.error("Token URI is empty");
      setError("Failed to fetch profile data: Token URI is empty");
      return;
    }

    try {
      const pinataBaseURL = "https://tomato-defensive-ape-989.mypinata.cloud/ipfs/";
      const backupGateway = "https://cloudflare-ipfs.com/ipfs/";
      
      let response = await fetch(uri.replace("ipfs://", pinataBaseURL));

      console.log("response",response);
      
      if (!response.ok) {
        console.log("Trying backup IPFS gateway...");
        response = await fetch(uri.replace("ipfs://", backupGateway));
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setProfileData(data);
    } catch (error) {
      console.error("Error fetching profile data:", error);
      setError("Failed to fetch profile data. Please try again later.");
    }
  };

  const { writeContractAsync } = useWriteContract();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const uploadImageToPinata = async (file: File) => {
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
      const res = await response.json();
      console.log("image hash",res);
      return res.IpfsHash;
    } catch (error) {
      console.error("Error uploading to IPFS:", error);
      throw new Error("Failed to upload image");
    }
  };

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
      const res = await response.json();
      console.log("metadata hash",res);
      return res.IpfsHash;
    } catch (error) {
      console.error("Error pinning metadata to IPFS:", error);
      throw new Error("Failed to upload metadata");
    }
  };

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
      setError("Please connect your wallet first");
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!imageFile) throw new Error("Please select a profile image");
      const imageHash = await uploadImageToPinata(imageFile);

      const metadata = {
        name,
        age: parseInt(age),
        gender,
        funFact,
        description,
        image: `ipfs://${imageHash}`,
      };

      console.log("metadata",metadata);
      const metadataHash = await uploadMetadataToPinata(metadata);
      const uri = `ipfs://${metadataHash}`;

      console.log("uri ",uri);

      const receipt = await writeContractAsync({
        address: profileaddress,
        abi: SocialAbi,
        functionName: "mintProfileNFT",
        args: [uri],
      });

      const tx = waitForTransactionReceipt(config, { hash: receipt });
      console.log("tx",tx);
      setSuccess("Profile created successfully!");
      setProfileExists(true);
      setProfileData(metadata);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl"
      >
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-8 bg-gradient-to-r from-blue-500 to-purple-600">
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
              <User className="w-10 h-10 mr-3 text-yellow-300" />
              Create Your Profile
            </h1>
            <p className="text-blue-100">Join our community and share your story</p>
          </div>

          {isProfileLoading ? (
            <div className="p-8 flex justify-center">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : profileExists ? (
            <div className="p-8 space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Your Profile</h2>
              {profileData ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-1">
                    <img src={profileData.image.replace("ipfs://", "https://ipfs.io/ipfs/") || "/placeholder.svg"} alt="Profile" className="w-full h-64 object-cover rounded-lg shadow-md" />
                  </div>
                  <div className="md:col-span-2 space-y-4">
                    <p className="text-gray-800"><span className="font-bold">Name:</span> {profileData.name}</p>
                    <p className="text-gray-800"><span className="font-bold">Age:</span> {profileData.age}</p>
                    <p className="text-gray-800"><span className="font-bold">Gender:</span> {profileData.gender}</p>
                    <p className="text-gray-800"><span className="font-bold">Fun Fact:</span> {profileData.funFact}</p>
                    <p className="text-gray-800"><span className="font-bold">Description:</span> {profileData.description}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">Loading profile data...</p>
              )}
            </div>
          ) : (
            <form onSubmit={handleCreateProfile} className="p-8 space-y-6">
              <div className="flex flex-col items-center mb-8">
                <div className="relative w-32 h-32 mb-4">
                  {imagePreview ? (
                    <img src={imagePreview || "/placeholder.svg"} alt="Profile Preview" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  <label htmlFor="image" className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full cursor-pointer hover:bg-blue-600 transition-colors">
                    <Camera className="w-5 h-5 text-white" />
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
                <p className="text-sm text-gray-500">Upload your profile picture</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-2 rounded-md bg-gray-50 border border-gray-300 text-gray-900 focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-300"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="age" className="block text-sm font-medium text-gray-700">Age</label>
                  <input
                    id="age"
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    required
                    className="w-full px-4 py-2 rounded-md bg-gray-50 border border-gray-300 text-gray-900 focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-300"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
                  <input
                    id="gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    required
                    className="w-full px-4 py-2 rounded-md bg-gray-50 border border-gray-300 text-gray-900 focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-300"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="funFact" className="block text-sm font-medium text-gray-700">Fun Fact</label>
                  <input
                    id="funFact"
                    value={funFact}
                    onChange={(e) => setFunFact(e.target.value)}
                    required
                    className="w-full px-4 py-2 rounded-md bg-gray-50 border border-gray-300 text-gray-900 focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-300"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">About Me</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="w-full px-4 py-2 rounded-md bg-gray-50 border border-gray-300 text-gray-900 focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-300 h-32 resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !isConnected}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-full transition duration-300 ease-in-out flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" />
                    Creating Profile...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 mr-2" />
                    Create My Profile
                  </span>
                )}
              </button>
            </form>
          )}

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 mx-8 mb-8 bg-red-100 border border-red-400 text-red-700 rounded-lg"
            >
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 mx-8 mb-8 bg-green-100 border border-green-400 text-green-700 rounded-lg"
            >
              {success}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

