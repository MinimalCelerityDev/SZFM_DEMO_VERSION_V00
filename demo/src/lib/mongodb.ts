import { MongoClient } from 'mongodb';

const uri: string = process.env.MONGODB_URI!;

if (!uri) {
  throw new Error('Itt add meg az .env.local-ban specifkált változókat ( összekőtésekt )');
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {

    //Fejlesztési környezet
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {

    //Éles környezet
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default clientPromise;
