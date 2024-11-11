import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { getTransactions } from "@/lib/transactions"; 

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    // gets session to verify logged-in user
    const session = await getSession({ req });

    if (!session || !session.user?.email) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const email = session.user.email;

    // query the database to count transactions for the logged-in user's email
    const transactions = await getTransactions(false); // gets all transactions without summaries
    const userTransactions = transactions.filter(txn => txn.customer_email === email);

    const transactionCount = userTransactions.length;

    // check promo eligibility: every 5th transaction
    const isEligibleForPromo = transactionCount > 0 && transactionCount % 5 === 0;
    const promoCode = isEligibleForPromo ? "PANDA5" : null;

    // return the promo eligibility and details
    res.status(200).json({
      email,
      transactionCount,
      isEligibleForPromo,
      promoCode,
    });
  } catch (error) {
    console.error("Error fetching promo eligibility:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
