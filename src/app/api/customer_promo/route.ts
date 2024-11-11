import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { getTransactions } from "@/lib/transactions";
import { google } from "googleapis";

const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_GOOGLE_CLIENT_ID,
  process.env.GMAIL_GOOGLE_CLIENT_SECRET,
  process.env.GMAIL_GOOGLE_API_REDIRECT_URI
);

oauth2Client.setCredentials({
  refresh_token: process.env.GMAIL_GOOGLE_REFRESH_TOKEN,
});

// to send promo email
async function sendPromoEmail(to: string) {
  try {
    console.log("Preparing to send email...");
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    const email = [
      `To: ${to}`,
      "Content-Type: text/plain; charset=utf-8",
      "Subject: Your Panda Express Promo Code",
      "",
      `Congratulations! Use the promo code "PANDA20" for 20% off your next order.`,
    ].join("\n");

    const encodedEmail = Buffer.from(email)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    console.log("Encoded email:", encodedEmail);

    const response = await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodedEmail,
      },
    });

    console.log("Promo email sent successfully:", response.data);
  } catch (error) {
    console.error("Error sending promo email:", error);
    throw new Error("Failed to send promo email.");
  }
}


// promo handler
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
    const transactions = await getTransactions(false); 
    const userTransactions = transactions.filter(txn => txn.customer_email === email);

    const transactionCount = userTransactions.length;

    //  promo eligibility: every 5th transaction
    const isEligibleForPromo = transactionCount > 0 && transactionCount % 5 === 0;
    const promoCode = isEligibleForPromo ? "PANDA20" : null;

    //  promo email if eligible
    if (isEligibleForPromo) {
      await sendPromoEmail(email);
    }

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
