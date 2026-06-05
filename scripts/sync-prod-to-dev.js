const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const { S3Client, ListObjectsV2Command, CopyObjectCommand } = require('@aws-sdk/client-s3');

// Simple .env.dev parser
const envPath = path.resolve(process.cwd(), '.env.dev');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      value = value.replace(/\\n/g, '\n');
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

async function syncMongo() {
  const prodUri = process.env.PROD_MONGODB_URI;
  const devUri = process.env.DEV_MONGODB_URI;

  if (!prodUri || !devUri) {
    console.error('Missing PROD_MONGODB_URI or DEV_MONGODB_URI');
    process.exit(1);
  }

  const prodClient = new MongoClient(prodUri);
  const devClient = new MongoClient(devUri);

  try {
    console.log('Connecting to MongoDB instances...');
    await prodClient.connect();
    await devClient.connect();

    console.log('Connected to both MongoDB instances.');

    // We explicitly use 'nobelium' for prod and 'nobelium-dev' for dev.
    const prodDb = prodClient.db('nobelium'); 
    const devDb = devClient.db('nobelium-dev');

    const collections = await prodDb.listCollections().toArray();

    for (const collInfo of collections) {
      const collName = collInfo.name;
      if (collName.startsWith('system.')) continue;
      
      console.log(`Syncing collection: ${collName}`);
      const prodCollection = prodDb.collection(collName);
      const devCollection = devDb.collection(collName);

      const docs = await prodCollection.find({}).toArray();
      
      // Clear dev collection first
      await devCollection.deleteMany({});

      if (docs.length > 0) {
        await devCollection.insertMany(docs);
      }
      console.log(`Synced ${docs.length} documents for ${collName}`);
    }

    console.log('MongoDB sync completed successfully.\n');
  } catch (error) {
    console.error('Error syncing MongoDB:', error);
  } finally {
    await prodClient.close();
    await devClient.close();
  }
}

async function syncR2() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const prodBucket = process.env.PROD_R2_BUCKET_NAME;
  const devBucket = process.env.DEV_R2_BUCKET_NAME;

  if (!accountId || !accessKeyId || !secretAccessKey || !prodBucket || !devBucket) {
    console.error('Missing R2 environment variables');
    process.exit(1);
  }

  const s3 = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  try {
    console.log('Fetching objects from PROD R2 bucket...');
    let continuationToken = undefined;
    let totalObjects = 0;

    do {
      const listCommand = new ListObjectsV2Command({
        Bucket: prodBucket,
        ContinuationToken: continuationToken,
      });

      const response = await s3.send(listCommand);
      
      if (response.Contents && response.Contents.length > 0) {
        for (const object of response.Contents) {
          const key = object.Key;
          
          const copyCommand = new CopyObjectCommand({
            Bucket: devBucket,
            CopySource: encodeURI(`${prodBucket}/${key}`),
            Key: key,
          });

          await s3.send(copyCommand);
          totalObjects++;
          if (totalObjects % 50 === 0) {
            console.log(`Copied ${totalObjects} objects...`);
          }
        }
      }

      continuationToken = response.NextContinuationToken;
    } while (continuationToken);

    console.log(`R2 sync completed successfully. Copied ${totalObjects} total objects.`);
  } catch (error) {
    console.error('Error syncing R2:', error);
  }
}

async function main() {
  console.log('Starting sync from PROD to DEV...');
  await syncMongo();
  await syncR2();
  console.log('All sync tasks completed.');
}

main().catch(console.error);
