import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../lib/mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const client = await clientPromise;
  const db = client.db("demo_version");

  if (req.method === "POST") {
    try {
      const { userId, data } = req.body;

      if (!userId) {
        return res.status(400).json({ message: "Nincs userId mező betöltve" });
      }

      if (data) {
        await db.collection("users_data_final_demo").updateOne(
          { userId },
          { $set: { ...data } },
          { upsert: true }
        );
        return res.status(200).json({ message: "Felhasználó adatok sikeresen el mentve" });
      } else {
        const userData = await db.collection("users_data_final_demo").findOne({ userId });
        if (!userData) {
          return res.status(404).json({ message: "Nem található adat" });
        }
        return res.status(200).json(userData);
      }
    } catch (error) {
      console.error("Hiba merült fel a processing közben", error);
      return res.status(500).json({ message: "Belső hálózati hiba", error: error.message });
    }
  } else {
    return res.status(405).json({ message: "Nem megengedett metódus" });
  }
}
