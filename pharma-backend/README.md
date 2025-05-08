Here is the content for a proper `README.md` file. You can copy and save it as `README.md` in your project directory.

---

# **PharmaSafe - Medicine Authenticity System**

PharmaSafe is a blockchain-based system for verifying the authenticity of medicines. It uses a combination of a PostgreSQL database and Ethereum smart contracts to track the lifecycle of medicines and ensure their authenticity.

---

## **Features**

- Add products to the database.
- Track product stages in the supply chain.
- Finalize products and store their hash on the blockchain after the "Complete" stage.
- Verify product authenticity by comparing blockchain and database hashes.

---

## **Setup Instructions**

### **1. Prerequisites**

- **Node.js**: Install [Node.js](https://nodejs.org/) (v16 or later).
- **PostgreSQL**: Install [PostgreSQL](https://www.postgresql.org/).
- **Hardhat**: Install Hardhat for Ethereum development.
- **Git**: Install [Git](https://git-scm.com/).

---

### **2. Clone the Repository**

```bash
git clone https://github.com/your-repo/pharma-safe.git
cd pharma-safe
```

---

### **3. Install Dependencies**

Navigate to the backend and frontend directories and install the required dependencies:

#### Backend:

```bash
cd pharma-backend
npm install
```

#### Frontend:

```bash
cd ../pharma-auth-app
npm install
```

---

### **4. Set Up the PostgreSQL Database**

1. **Create a Database**:
   Open PostgreSQL and create a new database:

   ```sql
   CREATE DATABASE medicine_authenticity;
   ```

2. **Create Tables**:
   Use the following SQL to create the required tables:

   ```sql
   -- Table for storing product details
   CREATE TABLE products (
       product_id VARCHAR(255) PRIMARY KEY,
       product_type VARCHAR(255) NOT NULL,
       batch_number VARCHAR(255) NOT NULL,
       manufacturing_date TIMESTAMP NOT NULL,
       expiry_date TIMESTAMP NOT NULL,
       latest_stage VARCHAR(255) NOT NULL
   );

   -- Table for storing product stages
   CREATE TABLE stages (
       id SERIAL PRIMARY KEY,
       product_id VARCHAR(255) REFERENCES products(product_id),
       stage_name VARCHAR(255) NOT NULL,
       authenticator VARCHAR(255) NOT NULL,
       timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

---

### **5. Configure Environment Variables**

Create a `.env` file in the pharma-backend directory and add the following variables:

```env
# Blockchain Configuration
PROVIDER_URL=http://localhost:8545
PRIVATE_KEY=your_private_key_here
CONTRACT_ADDRESS=your_contract_address_here

# PostgreSQL Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_postgres_user
DB_PASSWORD=your_postgres_password
DB_NAME=pharma_safe
```

---

### **6. Start the Hardhat Node**

Start a local Ethereum blockchain using Hardhat:

```bash
npx hardhat node
```

---

### **7. Deploy the Smart Contract**

Deploy the `MedicineAuthenticity` smart contract to the local blockchain:

```bash
npx hardhat run scripts/deploy.js --network localhost
```

Copy the deployed contract address and update the `CONTRACT_ADDRESS` in the `.env` file.

---

### **8. Start the Backend Server**

Navigate to the pharma-backend directory and start the server:

```bash
cd pharma-backend
node server.js
```

The backend server will run at `http://localhost:3001`.

---

### **9. Start the Frontend**

Navigate to the pharma-auth-app directory and start the frontend:

```bash
cd ../pharma-auth-app
npm run dev
```

The frontend will run at `http://localhost:3000`.

---

## **Usage**

### **CLI Commands**

Run the following commands from the pharma-backend directory:

1. **Add a Product**:

   ```bash
   node cli.js addProduct <productID> <productType> <batchNumber>
   ```

   Example:

   ```bash
   node cli.js addProduct P1234 MedicineA B001
   ```

2. **Add a Stage**:

   ```bash
   node cli.js addStage <productID> <stageName>
   ```

   Example:

   ```bash
   node cli.js addStage P1234 Manufacturing
   ```

3. **Verify a Product**:
   ```bash
   node cli.js verify <productID>
   ```
   Example:
   ```bash
   node cli.js verify P1234
   ```

---

### **Frontend**

1. Open the frontend in your browser at `http://localhost:3000`.
2. Use the UI to add products, add stages, and verify products.

---

## **Project Structure**

```
pharma-safe/
├── pharma-backend/          # Backend code
│   ├── contracts/           # Solidity smart contracts
│   ├── scripts/             # Deployment scripts
│   ├── cli.js               # Command-line interface
│   ├── server.js            # Backend server
│   └── db.js                # Database connection
├── pharma-auth-app/         # Frontend code
│   ├── pages/               # Next.js pages
│   ├── components/          # React components
│   └── public/              # Static assets
└── README.md                # Project documentation
```

---

## **Testing**

### **1. Add a Product**

```bash
node cli.js addProduct P1234 MedicineA B001
```

### **2. Add Stages**

```bash
node cli.js addStage P1234 Manufacturing
node cli.js addStage P1234 Packaging
node cli.js addStage P1234 Complete
```

### **3. Verify the Product**

```bash
node cli.js verify P1234
```

---

## **License**

This project is licensed under the MIT License.

---

Save this content as `README.md` in your project directory.

# ❗❗If restart blockchain, make sure to clear database tables as well, else there will be a conflict

To Consider : these info for the products table : last_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

Prerequisites to Run the Full Application
🗄️ Database Ready
PostgreSQL installed and running
Create medicine_authenticity DB and the products table
Configure .env with correct DB credentials
⛓️ Smart Contract - Blockchain
Run npx hardhat node to start local blockchain
Deploy MedicineAuthenticity.sol via npx hardhat run scripts/deploy.js --network localhost
Update cli.js with the new contract address
🚀 Start Backend Server
Run node server.js (or equivalent server start command) in your backend folder
Ensure it can access both the blockchain and PostgreSQL DB
🌐 Run Frontend
Start the Next.js frontend via npm run dev
Make sure it connects properly to the backend API routes and smart contract
testing