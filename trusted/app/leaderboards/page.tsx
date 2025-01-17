"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Crown, Loader2 } from 'lucide-react';
import { useReadContract } from "wagmi";
import { tokenaddress, tokenabi } from "@/app/abi";

export default function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState<{ address: string; balance: bigint }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { data, isError, isLoading: isContractLoading } = useReadContract({
    address: tokenaddress,
    abi: tokenabi,
    functionName: "getTop10Leaderboard",
  });

  useEffect(() => {
    if (data && !isContractLoading) {
      const [addresses, balances] = data as [string[], bigint[]];
      const filteredData = addresses
        .map((address, index) => ({ address, balance: balances[index] }))
        .filter(item => item.address !== "0x0000000000000000000000000000000000000000" && item.balance > BigInt(0))
        .sort((a, b) => (b.balance > a.balance ? 1 : -1));
      setLeaderboardData(filteredData);
      setIsLoading(false);
    }
  }, [data, isContractLoading]);

  useEffect(() => {
    if (isError) {
      setError("Failed to fetch leaderboard data. Please try again later.");
      setIsLoading(false);
    }
  }, [isError]);

  const formatAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;

  const formatBalance = (balance: bigint) => {
    const balanceInEth = Number(balance) / 1e18;
    return balanceInEth.toFixed(2);
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="w-8 h-8 text-yellow-300" />;
      case 1:
        return <Medal className="w-8 h-8 text-gray-300" />;
      case 2:
        return <Medal className="w-8 h-8 text-yellow-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl"
      >
        <div className="bg-gray-900 border-4 border-yellow-400 rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-8 bg-gradient-to-r from-purple-600 to-pink-600">
            <h1 className="text-4xl font-bold text-yellow-300 mb-2 flex items-center font-game">
              <Trophy className="w-12 h-12 mr-3 text-yellow-300" />
              TrustEd Leaderboard
            </h1>
            <p className="text-blue-200 font-game text-sm">Top 10 TrustEd Token Holders</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-16 h-16 text-purple-500 animate-spin" />
            </div>
          ) : error ? (
            <div className="p-8 text-red-400 text-center font-game">{error}</div>
          ) : (
            <div className="p-8">
              <div className="space-y-6">
                {leaderboardData.map((item, index) => (
                  <motion.div
                    key={item.address}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-gradient-to-r from-purple-800 to-indigo-800 rounded-lg p-4 flex items-center justify-between border-2 border-pink-500"
                  >
                    <div className="flex items-center space-x-4">
                      <span className="text-3xl font-bold text-yellow-300 w-12 text-center font-game">
                        {getRankIcon(index) || `#${index + 1}`}
                      </span>
                      <div>
                        <p className="text-white font-semibold font-game">{formatAddress(item.address)}</p>
                        <p className="text-xs text-pink-300 font-game">Address</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-green-400 font-game">{formatBalance(item.balance)}</p>
                      <p className="text-xs text-pink-300 font-game">TrustEd Tokens</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

