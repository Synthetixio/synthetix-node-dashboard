### This guide provides step-by-step instructions to upload and publish a DApp project using the command line.

## Prerequisites

1. **Environment Variables**:
    - `JWT_TOKEN`: A token received after authorization.
    - `NAMESPACE`: The name of your project.
    - `PRIVATE_KEY`: The secret key linked to your Ethereum account. Keep it secure and never share it.
    - `API_URL`: The base endpoint.
    - `CONTRACT_ADDRESS`: The deployed contract address for your DApp.
    - `RPC_URL`: Set to `optimism-sepolia`.

   Use the command `source .env` to make these variables available in your environment.

2. Ensure that **Node.js**, **Foundry**, **jq**, and **curl** are preinstalled.

## Step 1: Check Unique Namespace

To ensure your namespace is unique, execute the following command in the terminal:

```bash
curl -s -X POST "${API_URL}unique-namespace" \
-H "Authorization: Bearer $JWT_TOKEN" \
-H "Content-Type: application/json" \
-d '{"namespace":"'"$NAMESPACE"'"}' | jq -r '.unique'
```

## Step 2: Check Unique Generated Key

To ensure your generated key is unique, execute the following command in the terminal:

```bash
curl -s -X POST "${API_URL}unique-generated-key" \
-H "Authorization: Bearer $JWT_TOKEN" \
-H "Content-Type: application/json" \
-d '{"key":"'"$NAMESPACE"'"}' | jq -r '.unique'
```

## Step 3: Mint Namespace Token

Mint a token for the namespace by running the following command:

```bash
cast send $CONTRACT_ADDRESS "safeMint(string)" "$NAMESPACE" \
  --rpc-url $RPC_URL \
  --private-key "$PRIVATE_KEY"
```

## Step 4: Generate Key Pair

Generate a key pair for the namespace:

```bash
curl -s -X POST "${API_URL}api/v0/key/gen?arg=$NAMESPACE&type=rsa" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" | jq
```

## Step 5: Build the Project

Build the project using:

```bash
npm run build
# or
yarn build
```
Alternatively, you can use any previously built project.

## Step 6: Generate CAR File

Generate a Content Addressable Archive (CAR) file by running the following command:

```bash
node generateCarBlob.js
```

## Step 7: Import the CAR File

Import the generated CAR file using the following command:

```bash
curl -s -X POST "${API_URL}api/v0/dag/import?pin-roots=true" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -F "file=@$(find car_files -type f -name "*.car")" | jq
```

Ensure the `car_files` directory contains the CAR file generated in the previous step.

## Step 8 (Optional): Fetch the DAG

Fetch the DAG content:

```bash
curl -s -X POST "${API_URL}api/v0/dag/get?arg=<PASTE_ROOT_CID_HERE>" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" | jq
```

**Note:** Replace `<PASTE_ROOT_CID_HERE>` with the actual Root CID (retrieved from the response of the `dag/import` step).

## Step 9: Publish Name with Root CID

Publish the name linked to the Root CID:

```bash
curl -s -X POST "${API_URL}api/v0/name/publish?key=<PASTE_KEY_NAME_HERE>&arg=/ipfs/<PASTE_ROOT_CID_HERE>&ttl=10s" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" | jq
```

### Notes:
- Replace `<PASTE_KEY_NAME_HERE>` with the key name from the `key/gen` step (e.g., `nebula-forge`).
- Replace `<PASTE_ROOT_CID_HERE>` with the Root CID from the `dag/import` step.
