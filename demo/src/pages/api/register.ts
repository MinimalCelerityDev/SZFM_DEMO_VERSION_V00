import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import clientPromise from "../../lib/mongodb";

interface ResponseType {
  message: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseType>) {
  if (req.method === "POST") {
    try {
      const { firstName, lastName, email, password } = req.body;
      const client = await clientPromise;
      const db = client.db("demo_version");

      const existingUser = await db.collection("users").findOne({ email });
      if (existingUser) {
        return res.status(409).json({ message: "Ez a felhasználó már létezik" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await db.collection("users").insertOne({
        firstName,
        lastName,
        email,
        password: hashedPassword,
      });

      res.status(201).json({ message: "Felhasználó regisztrálva" });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  } else {
    res.status(405).json({ message: "Nem megengedett metódus" });
  }
}
