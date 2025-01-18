import { useAccount } from 'wagmi'
import { useState,useEffect } from 'react'
import { readContract } from '@wagmi/core'
import { CredentialNFTAddress, credentialNFTAbi } from '@/app/abi'
import { config } from '@/app/wagmi'
import CredentialCard from './CredentialCard2'

export function CredentialsSection() {
  const { address } = useAccount()
  const [credentials, setCredentials] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (address) {
      fetchCredentials()
    }
  }, [address])

  const fetchMetadata = async (uri: string) => {
    try {
      const pinataBaseURL = 'https://tomato-defensive-ape-989.mypinata.cloud/ipfs/'
      const formattedURI = uri.replace('ipfs://', pinataBaseURL)
      const response = await fetch(formattedURI)
      if (!response.ok) {
        throw new Error('Failed to fetch metadata.')
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching metadata:', error)
      throw new Error('Failed to fetch metadata.')
    }
  }

  const fetchCredentials = async () => {
    try {
      setIsLoading(true)
      const tokenIds = await readContract(config, {
        address: CredentialNFTAddress,
        abi: credentialNFTAbi,
        functionName: 'getTokensByOwner',
        args: [address],
      })

      const credentialPromises = (tokenIds as string[]).map(async (tokenId) => {
        const tokenURI = await readContract(config, {
          address: CredentialNFTAddress,
          abi: credentialNFTAbi,
          functionName: 'tokenURI',
          args: [tokenId],
        }) as string

        if (tokenURI === 'ipfs://') {
          console.log(`Skipping credential with tokenId ${tokenId} due to invalid URI`)
          return null
        }

        const metadata = await fetchMetadata(tokenURI)
        return { ...metadata, tokenId }
      })


      const credentialData = (await Promise.all(credentialPromises)).filter(Boolean)
      setCredentials(credentialData.filter((cred): cred is NonNullable<typeof cred> => cred !== null))
    } catch (error) {
      console.error('Error fetching credentials:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mt-8">
      <h2 className="text-3xl font-bold text-white mb-6">Your Credentials</h2>
      {isLoading ? (
        <div className="text-white">Loading credentials...</div>
      ) : credentials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {credentials.map((credential) => (
            <CredentialCard key={credential.tokenId} credential={credential} />
          ))}
        </div>
      ) : (
        <div className="text-white">No credentials found.</div>
      )}
    </div>
  )
}

