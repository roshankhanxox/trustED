
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Upload, CheckCircle, Loader2, User, FileText, Key, Camera, Edit } from 'lucide-react';
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "@wagmi/core";
import { SocialAbi, profileaddress } from "@/app/abi";
import { config } from "@/app/wagmi";
import { CredentialsSection } from "./CredentialCard";


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
  const [isEditing, setIsEditing] = useState(false); // Added state for editing
  
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

      console.log("response", response);
      
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
      console.log("image hash", res);
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
      console.log("metadata hash", res);
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

      console.log("metadata", metadata);
      const metadataHash = await uploadMetadataToPinata(metadata);
      const uri = `ipfs://${metadataHash}`;

      console.log("uri ", uri);

      const receipt = await writeContractAsync({
        address: profileaddress,
        abi: SocialAbi,
        functionName: "mintProfileNFT",
        args: [uri],
      });

      const tx = await waitForTransactionReceipt(config, { hash: receipt });
      console.log("tx", tx);
      setSuccess("Profile created successfully!");
      setProfileExists(true);
      setProfileData(metadata);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
      setError("Please connect your wallet first");
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let newImageHash = profileData.image.split('/').pop();
      if (imageFile) {
        newImageHash = await uploadImageToPinata(imageFile);
      }

      const metadata = {
        name,
        age: parseInt(age),
        gender,
        funFact,
        description,
        image: `ipfs://${newImageHash}`,
      };

      console.log("Updated metadata", metadata);
      const metadataHash = await uploadMetadataToPinata(metadata);
      const uri = `ipfs://${metadataHash}`;

      console.log("Updated URI", uri);

      const receipt = await writeContractAsync({
        address: profileaddress,
        abi: SocialAbi,
        functionName: "updateProfile",
        args: [uri],
      });

      const tx = await waitForTransactionReceipt(config, { hash: receipt });
      console.log("Update transaction", tx);
      setSuccess("Profile updated successfully!");
      setProfileData(metadata);
      setIsEditing(false);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
              <User className="w-10 h-10 mr-3 text-yellow-300" />
              {profileExists ? "Your Profile" : "Create Your Profile"}
            </h1>
            <p className="text-blue-100">
              {profileExists ? "Welcome back! Here's your profile information." : "Join our community and share your story"}
            </p>
          </header>

          {isProfileLoading ? (
            <div className="flex justify-center">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : profileExists ? (
            <div className="bg-gray-800 rounded-lg shadow-md p-6 border border-gray-700">
              {isEditing ? (
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="flex flex-col items-center mb-8">
                    <div className="relative w-32 h-32 mb-4">
                      <img
                        src={imagePreview || (profileData?.image ? profileData.image.replace("ipfs://", "https://tomato-defensive-ape-989.mypinata.cloud/ipfs/") : "/placeholder.svg")}
                        alt="Profile Preview"
                        className="w-full h-full object-cover rounded-full"
                      />
                      <label htmlFor="image" className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full cursor-pointer hover:bg-blue-600 transition-colors">
                        <Camera className="w-5 h-5 text-white" />
                        <input
                          id="image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <p className="text-sm text-gray-400">Upload a new profile picture</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label="Name" id="name" value={name} onChange={setName} icon={<User className="w-4 h-4 mr-2 text-purple-400" />} />
                    <FormField label="Age" id="age" value={age} onChange={setAge} type="number" icon={<FileText className="w-4 h-4 mr-2 text-purple-400" />} />
                    <FormField label="Gender" id="gender" value={gender} onChange={setGender} icon={<FileText className="w-4 h-4 mr-2 text-purple-400" />} />
                    <FormField label="Fun Fact" id="funFact" value={funFact} onChange={setFunFact} icon={<Key className="w-4 h-4 mr-2 text-purple-400" />} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-300">About Me</label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                      className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 text-white focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-300 h-32 resize-none"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center">
                          <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                          Updating...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Update Profile
                        </span>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-1">
                    <img 
                      src={profileData?.image ? profileData.image.replace("ipfs://", "https://tomato-defensive-ape-989.mypinata.cloud/ipfs/") : "/placeholder.svg"} 
                      alt="Profile" 
                      className="w-full h-64 object-cover rounded-lg shadow-md" 
                    />
                    <div className="mt-4 flex justify-center">
                      <button
                        onClick={() => {
                          setName(profileData.name || '');
                          setAge(profileData.age?.toString() || '');
                          setGender(profileData.gender || '');
                          setFunFact(profileData.funFact || '');
                          setDescription(profileData.description || '');
                          setIsEditing(true);
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out flex items-center"
                        title="Edit Profile"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                      </button>
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-4">
                    <ProfileField label="Name" value={profileData?.name} />
                    <ProfileField label="Age" value={profileData?.age} />
                    <ProfileField label="Gender" value={profileData?.gender} />
                    <ProfileField label="Fun Fact" value={profileData?.funFact} />
                    <ProfileField label="Description" value={profileData?.description} />
                    <CredentialsSection />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg shadow-md p-6 border border-gray-700">
              <form onSubmit={handleCreateProfile} className="space-y-6">
                <div className="flex flex-col items-center mb-8">
                  <div className="relative w-32 h-32 mb-4">
                    {imagePreview ? (
                      <img src={imagePreview || "/placeholder.svg"} alt="Profile Preview" className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <div className="w-full h-full bg-gray-700 rounded-full flex items-center justify-center">
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
                  <p className="text-sm text-gray-400">Upload your profile picture</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField label="Name" id="name" value={name} onChange={setName} icon={<User className="w-4 h-4 mr-2 text-purple-400" />} />
                  <FormField label="Age" id="age" value={age} onChange={setAge} type="number" icon={<FileText className="w-4 h-4 mr-2 text-purple-400" />} />
                  <FormField label="Gender" id="gender" value={gender} onChange={setGender} icon={<FileText className="w-4 h-4 mr-2 text-purple-400" />} />
                  <FormField label="Fun Fact" id="funFact" value={funFact} onChange={setFunFact} icon={<Key className="w-4 h-4 mr-2 text-purple-400" />} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-300">About Me</label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 text-white focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-300 h-32 resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading || !isConnected}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
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
            </div>
          )}

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-200"
            >
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-200"
            >
              {success}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

const ProfileField = ({ label, value }: { label: string; value: string | number }) => (
  <div className="bg-gray-700 p-4 rounded-md">
    <p className="text-purple-400 text-sm font-semibold mb-1">{label}</p>
    <p className="text-white font-medium break-words">{value}</p>
  </div>

  
);

const FormField = ({ label, id, value, onChange, type = "text", icon }: { label: string; id: string; value: string; onChange: (value: string) => void; type?: string; icon: React.ReactNode }) => (
  <div className="space-y-2">
    <label htmlFor={id} className="block text-sm font-medium text-gray-300 flex items-center">
      {icon}
      {label}
    </label>
    <input
      type={type}
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required
      className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 text-white focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-300"
    />
  </div>
);

