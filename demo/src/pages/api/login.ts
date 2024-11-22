import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import clientPromise from "../../lib/mongodb";

interface UserType {
  _id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface ResponseType {
  message: string;
  token?: string;
  user?: { userId: string; firstName: string; lastName: string; email: string };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseType>) {
  if (req.method === "POST") {
    try {
      const { email, password } = req.body;
      const client = await clientPromise;
      const db = client.db("demo_version");

      const user = await db.collection<UserType>("users").findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "Nem található felhasználó" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Helytelen jelszó" });
      }

      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: "2h" });

      res.status(200).json({
        message: "Sikeresen bejelentkezett",
        token,
        user: {
          userId: user._id.toString(),
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  } else {
    res.status(405).json({ message: "Nem érvényes metódust haszná" });
  }
}
