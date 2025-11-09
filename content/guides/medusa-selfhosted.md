---
title: Build a Self-Hosted E-commerce Platform with Medusa and Neon Postgres
subtitle: Learn how to create and deploy a fully-featured e-commerce application using Medusa with Neon's serverless Postgres as the database backend
author: dhanush-reddy
enableTableOfContents: true
createdAt: '2025-11-09T00:00:00.000Z'
updatedOn: '2025-11-09T00:00:00.000Z'
---

Medusa is an open-source, composable e-commerce platform that provides a flexible backend for building modern e-commerce applications. When combined with Neon's serverless Postgres, you get a powerful, scalable solution for self-hosted e-commerce with instant database provisioning and automatic scaling.

In this guide, you'll learn how to set up a complete e-commerce application using Medusa with Neon as the database backend, including an optional Next.js storefront, and how to deploy it to your own infrastructure.

## Prerequisites

Before you begin, ensure you have the following:

- Node.js 18 or higher installed on your machine
- A [Neon account](https://console.neon.tech/signup) with a project created
- Basic familiarity with e-commerce concepts and JavaScript/TypeScript
- For deployment: Access to a VPS or cloud hosting provider

## What is Medusa?

Medusa is a modular e-commerce backend that provides:

- Product and inventory management
- Shopping cart and checkout functionality
- Order management
- Customer management
- Payment provider integrations
- Multi-region and multi-currency support
- Flexible plugin system

Unlike monolithic e-commerce platforms, Medusa gives you full control over your data and infrastructure while providing a robust API for building custom storefronts.

## Setting up Neon Postgres

First, let's set up your Neon database for Medusa.

### Create a Neon project

1. Navigate to the [Neon Console](https://console.neon.tech) and sign in
2. Click **New Project** to create a new project
3. Give your project a name (e.g., `medusa-store`)
4. Select your preferred region
5. Click **Create Project**

### Get your connection string

Once your project is created, you'll need the connection string:

1. In the Neon Console, navigate to your project's **Dashboard**
2. Find the **Connection Details** section
3. Copy the connection string, which should look like:

```bash
postgresql://neondb_owner:password@ep-xxxxx.region.neon.tech/neondb?sslmode=require&channel_binding=require
```

Keep this connection string handy - you'll need it in the next step.

## Creating your Medusa application

Medusa provides a convenient CLI tool that sets up everything you need, including database migrations.

### Run the Medusa setup command

Open your terminal and run the following command, replacing the connection string with your actual Neon database URL:

```bash shouldWrap
npx create-medusa-app@latest --db-url "postgresql://neondb_owner:password@ep-xxxxx.region.neon.tech/neondb?sslmode=require&channel_binding=require"
```

The setup wizard will ask you several questions:

1. **Project name**: Enter a name for your project (e.g., `my-medusa-store`)
2. **Do you want to create a Next.js storefront?**: Type `y` for yes if you want a ready-made storefront
3. **PostgreSQL password**: Press Enter (the connection string already includes credentials)

The installer will:

- Create a new Medusa backend project
- Install all necessary dependencies
- Run database migrations on your Neon database
- Optionally create a Next.js storefront
- Seed your database with sample data

This process typically takes 2-5 minutes depending on your internet connection.

### What gets created

After the setup completes, you'll have the following structure:

```plaintext
my-medusa-store/
├── backend/               # Medusa backend
│   ├── medusa-config.js  # Configuration file
│   ├── src/              # Custom code and endpoints
│   └── ...
└── storefront/           # Next.js storefront (if selected)
    ├── src/
    └── ...
```

The installer automatically:

- Configures the Medusa backend to connect to your Neon database
- Creates all necessary database tables (products, customers, orders, etc.)
- Seeds sample data including products and regions
- Sets up the Next.js storefront with the Medusa SDK

## Understanding the database setup

Let's take a look at what Medusa created in your Neon database.

### Database schema

Medusa creates a comprehensive e-commerce schema with tables for:

- **Products**: `product`, `product_variant`, `product_category`
- **Orders**: `order`, `line_item`, `fulfillment`
- **Customers**: `customer`, `address`
- **Inventory**: `inventory_item`, `inventory_level`
- **Regions**: `region`, `currency`, `payment_provider`
- **Store configuration**: `store`, `sales_channel`

You can view these tables in the Neon Console under the **Tables** section of your database.

### Configuration file

The Medusa backend configuration is stored in `backend/medusa-config.js`. You'll find the database connection configured like this:

```javascript
module.exports = {
  projectConfig: {
    database_url: process.env.DATABASE_URL,
    database_type: "postgres",
    // ... other config
  },
  // ... plugins and other settings
};
```

The `DATABASE_URL` environment variable is automatically set during installation, pointing to your Neon database.

## Running your Medusa application locally

Let's start your Medusa backend and storefront locally to test everything works.

### Start the Medusa backend

Navigate to the backend directory and start the server:

```bash
cd my-medusa-store/backend
npm run dev
```

The Medusa backend will start on `http://localhost:9000`. You should see output similar to:

```
info:    Server is ready on port: 9000
```

The backend provides:

- Admin API at `http://localhost:9000/admin`
- Store API at `http://localhost:9000/store`

### Start the storefront (if created)

If you created a Next.js storefront, open a new terminal and run:

```bash
cd my-medusa-store/storefront
npm run dev
```

The storefront will start on `http://localhost:8000`. You can now browse the sample products and test the checkout flow.

### Accessing the Admin Dashboard

Medusa includes a powerful admin dashboard for managing your store. To access it:

1. Visit [http://localhost:7001](http://localhost:7001) in your browser
2. Use the default credentials (check the installation output for the email and password)
3. You can now manage products, orders, customers, and more

## Deploying to production

Now that you've tested your Medusa application locally, let's deploy it to a production environment. Medusa can be deployed to various hosting providers including VPS servers, cloud platforms, and container services.

### Prepare for deployment

Before deploying, you need to set up production environment variables.

Create a `.env` file in your backend directory with the following:

```env
DATABASE_URL=postgresql://neondb_owner:password@ep-xxxxx.region.neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET=your-production-jwt-secret
COOKIE_SECRET=your-production-cookie-secret
NODE_ENV=production
```

Replace the values with:

- Your Neon database connection string
- Strong random strings for `JWT_SECRET` and `COOKIE_SECRET`

### Building the application

Build your Medusa backend for production:

```bash
cd backend
npm run build
```

This creates an optimized production build in the `dist` directory.

### Deployment options

#### Option 1: Deploy to a VPS (Ubuntu/Debian)

1. **Install Node.js on your VPS**:

   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **Install PM2** (process manager):

   ```bash
   sudo npm install -g pm2
   ```

3. **Upload your project** to the VPS using `rsync`, `scp`, or Git

4. **Install dependencies**:

   ```bash
   cd /path/to/backend
   npm ci --production
   ```

5. **Set environment variables**:

   ```bash
   export DATABASE_URL="your-neon-connection-string"
   export JWT_SECRET="your-jwt-secret"
   export COOKIE_SECRET="your-cookie-secret"
   ```

6. **Start the application with PM2**:

   ```bash
   pm2 start npm --name "medusa-backend" -- run start
   pm2 save
   pm2 startup
   ```

#### Option 2: Deploy with Docker

Create a `Dockerfile` in your backend directory:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .
RUN npm run build

EXPOSE 9000

CMD ["npm", "run", "start"]
```

Build and run:

```bash
docker build -t medusa-backend .
docker run -p 9000:9000 \
  -e DATABASE_URL="your-neon-connection-string" \
  -e JWT_SECRET="your-jwt-secret" \
  -e COOKIE_SECRET="your-cookie-secret" \
  medusa-backend
```

#### Option 3: Deploy to Railway, Render, or other platforms

Most modern hosting platforms support Node.js applications. Follow these general steps:

1. Connect your Git repository
2. Set the build command: `npm run build`
3. Set the start command: `npm run start`
4. Add environment variables (including `DATABASE_URL`)
5. Deploy

### Deploying the storefront

If you created a Next.js storefront, you can deploy it to Vercel, Netlify, or any Node.js hosting:

1. Update the `NEXT_PUBLIC_MEDUSA_BACKEND_URL` in your storefront's `.env.local`:

   ```env
   NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://your-backend-url.com
   ```

2. Build the storefront:

   ```bash
   npm run build
   ```

3. Deploy using your platform's CLI or Git integration

### Important: Database URL configuration

Regardless of where you deploy, make sure to:

1. Set the `DATABASE_URL` environment variable to your Neon connection string
2. Ensure the connection string includes `sslmode=require&channel_binding=require` for secure connections
3. Never commit your `.env` file to version control

The beauty of using Neon is that your database connection remains the same across all environments - you just need to update the `DATABASE_URL` environment variable in your deployment settings.

## Customizing your Medusa store

Now that you have a working Medusa application, here are some common customizations:

### Adding products programmatically

You can use the Medusa Admin API to add products:

```javascript
const medusa = require("@medusajs/medusa-js").default;

const client = new medusa.Medusa({ baseUrl: "http://localhost:9000", maxRetries: 3 });

// Login as admin
await client.admin.auth.getToken({
  email: "admin@medusa-test.com",
  password: "supersecret",
});

// Create a product
await client.admin.products.create({
  title: "New Product",
  description: "A great product",
  variants: [
    {
      title: "Default Variant",
      prices: [{ amount: 1999, currency_code: "usd" }],
    },
  ],
});
```

### Creating custom endpoints

Add custom business logic by creating new endpoints in `backend/src/api/`:

```javascript
// backend/src/api/index.js
export default async (rootDirectory, { container, app }) => {
  app.get("/store/custom", async (req, res) => {
    res.json({ message: "Custom endpoint" });
  });
};
```

### Integrating payment providers

Medusa supports multiple payment providers through plugins. Install a payment provider:

```bash
npm install @medusajs/payment-stripe
```

Then configure it in `medusa-config.js`:

```javascript
module.exports = {
  plugins: [
    {
      resolve: "@medusajs/payment-stripe",
      options: {
        api_key: process.env.STRIPE_API_KEY,
      },
    },
  ],
};
```

## Scaling considerations with Neon

Neon provides several features that make it ideal for e-commerce workloads:

### Autoscaling

Neon automatically scales your database compute based on load. During high-traffic events (like sales), your database will scale up automatically and scale down during quiet periods to save costs.

### Branching for development

Create database branches for testing new features:

```bash
# In the Neon Console, create a branch of your production database
# Update your local DATABASE_URL to point to the branch
```

This allows you to test migrations and new features without affecting your production data.

### Connection pooling

For production deployments, enable connection pooling by replacing your connection string's hostname:

```bash
# Original
postgresql://user:pass@ep-xxxxx.region.neon.tech/neondb

# With pooling
postgresql://user:pass@ep-xxxxx-pooler.region.neon.tech/neondb
```

This is especially important for serverless deployments where connection limits matter.

## Monitoring your application

### Database metrics

Monitor your database performance in the Neon Console:

- Query performance and slow queries
- Connection count and duration
- Storage usage
- Compute usage

### Application monitoring

For the Medusa backend, consider adding monitoring tools:

```bash
npm install @medusajs/medusa-telemetry
```

This provides insights into:

- API response times
- Order processing performance
- Background job execution

## Troubleshooting common issues

### Connection errors

If you encounter connection errors:

1. Verify your `DATABASE_URL` is correct
2. Ensure the connection string includes `sslmode=require&channel_binding=require`
3. Check that your Neon project is active (not suspended)
4. Verify your IP is not being blocked by any firewall rules

### Migration issues

If migrations fail during deployment:

```bash
# Manually run migrations
npm run medusa migrations run
```

### Performance optimization

For better performance:

1. Enable connection pooling (use the pooler hostname)
2. Add indexes for frequently queried fields
3. Use Neon's branching for testing before applying changes to production
4. Monitor slow queries in the Neon Console

## Conclusion

In this guide, we've built a complete self-hosted e-commerce platform using Medusa and Neon Postgres. We covered:

- Setting up Medusa with Neon as the database backend
- Creating a Next.js storefront
- Understanding the database schema
- Deploying to various hosting platforms
- Customizing and scaling your store

The combination of Medusa's flexible e-commerce backend and Neon's serverless Postgres gives you a powerful foundation for building scalable e-commerce applications. You maintain full control over your data and infrastructure while benefiting from Neon's automatic scaling and branching capabilities.

## Additional Resources

- [Medusa Documentation](https://docs.medusajs.com/)
- [Medusa Admin Dashboard](https://docs.medusajs.com/user-guide)
- [Medusa Plugins](https://docs.medusajs.com/plugins/overview)
- [Neon Documentation](/docs)
- [Neon Branching Guide](/docs/guides/branching-intro)
- [Database Connection Pooling](/docs/connect/connection-pooling)

<NeedHelp />
