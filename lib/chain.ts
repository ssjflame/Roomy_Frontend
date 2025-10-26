export type ChainConfig = {
  id: number
  name: string
  explorerUrl: string
}

function parseEnvChainId(): number {
  const envVal = process.env.NEXT_PUBLIC_OPENFORT_CHAIN_ID || process.env.OPENFORT_CHAIN_ID
  const parsed = Number(envVal)
  if (!envVal || Number.isNaN(parsed) || parsed <= 0) {
    return 11155111 // Default to Ethereum Sepolia
  }
  return parsed
}

export function getChainConfig(): ChainConfig {
  const id = parseEnvChainId()
  // Known mappings; extend as needed
  switch (id) {
    case 11155111:
      return {
        id,
        name: "Ethereum Sepolia",
        explorerUrl: "https://sepolia.etherscan.io",
      }
    case 80002:
      return {
        id,
        name: "Polygon Amoy",
        explorerUrl: "https://amoy.polygonscan.com",
      }
    case 421614:
      return {
        id,
        name: "Arbitrum Sepolia",
        explorerUrl: "https://sepolia.arbiscan.io",
      }
    default:
      // Fallback: assume Etherscan-style with /address and /tx paths
      return {
        id,
        name: `Chain ${id}`,
        explorerUrl: "https://etherscan.io",
      }
  }
}