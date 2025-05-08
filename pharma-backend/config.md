# Admin Access Debugging

There seems to be an issue where your admin wallet address (`0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266`) is not being recognized by the system. Here are some tools to debug and fix the issue:

## 1. Check Current Admins

Run the script to see which addresses are currently registered as admins:

```
node list-admins.js
```

This will list all admin addresses in the contract.

## 2. Verify Your Address

To check if your specific address is an admin:

```
node list-admins.js 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
```

## 3. Add Your Address as Admin

If your address is not in the admin list, add it:

```
node add-admin.js 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
```

## 4. Possible Issues

1. **Case sensitivity**: Ethereum addresses should be compared case-insensitive, which has been fixed in the latest code.
2. **Contract connection**: Make sure the contract address in your `.env` file matches the deployed contract.
3. **Network mismatch**: Ensure your wallet is connected to the same network as the backend.

## 5. Testing Admin Access

After adding your address as an admin, try these steps:

1. Restart the backend server to ensure it picks up any changes
2. Refresh the admin page in your browser
3. Disconnect and reconnect your wallet
4. Check the browser console and backend logs for debugging messages
