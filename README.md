## Script to execute crosschain CCTP tx via Squid

- add your PK in .env "PK=yourPK"
- yarn install
- yarn dev

### getting status via the Squid status API

curl --location 'https://testnet.v2.api.squidrouter.com/v2/status?transactionId=0xdf38d2e12d5996a32a09279d72110db26f8133bb71b6c1c881d0eb6075657f19&fromChainId=5&bridgeType=cctp&toChainId=grand-1'
