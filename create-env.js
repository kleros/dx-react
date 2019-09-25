const fs = require('fs')

fs.writeFileSync('./.env', `INFURA_PRODUCT_ID=${process.env.INFURA_PRODUCT_ID}\n\nIPFS_GATEWAY=${process.env.IPFS_GATEWAY}`)
