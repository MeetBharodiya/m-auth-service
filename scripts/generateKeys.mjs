import crypto from 'crypto'
import fs from 'fs'

const generateKeyPair = () => {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048, // Length of the key in bits
    publicKeyEncoding: {
      type: 'pkcs1', // Public key encoding format
      format: 'pem', // Output format
    },
    privateKeyEncoding: {
      type: 'pkcs1', // Private key encoding format
      format: 'pem', // Output format
    },
  })

  return { publicKey, privateKey }
}

// Function using async/await
const main = async () => {
  try {
    const keys = generateKeyPair()

    // Write keys to files
    fs.writeFileSync('certs/publicKey.pem', keys.publicKey)
    fs.writeFileSync('certs/privateKey.pem', keys.privateKey)
  } catch (err) {
    console.error('Error generating keys:', err)
  }
}

// Call the main function
main()
