import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; 
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

async function sendPromoEmail(to: string) {
  try {
    console.log("DEBUG: Initializing Gmail service...");
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    const emailContent = [
      `To: ${to}`,
      "Content-Type: text/plain; charset=utf-8",
      "Subject: Your Panda Express Promo Code",
      "",
      `Congratulations! Use the promo code "PANDA20" for 20% off your next order.`,
    ].join("\n");

    const encodedEmail = Buffer.from(emailContent)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    console.log("DEBUG: Sending email...");
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

// Export GET handler for App Router
export async function GET() {
  try {
    console.log("DEBUG: Starting promo check...");
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      console.error("DEBUG: No session or email found");
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const email = session.user.email;
    console.log("DEBUG: Checking promos for email:", email);

    const transactions = await getTransactions(false);
    const userTransactions = transactions.filter(
      (txn) => txn.customer_email === email
    );

    const transactionCount = userTransactions.length;
    console.log("DEBUG: Transaction count:", transactionCount);

    const promoThreshold = 5; // Number of transactions needed for a promo
    const isEligibleForPromo = transactionCount > 0 && transactionCount % promoThreshold === 0;
    const ordersUntilNextPromo = isEligibleForPromo ? 0 : promoThreshold - (transactionCount % promoThreshold);

    console.log("DEBUG: Is eligible for promo?", isEligibleForPromo);
    console.log("DEBUG: Orders until next promo:", ordersUntilNextPromo);

    if (isEligibleForPromo) {
      try {
        await sendPromoEmail(email);
        console.log("DEBUG: Promo email sent successfully");
      } catch (emailError) {
        console.error("DEBUG: Failed to send promo email:", emailError);
      }
    }

    return NextResponse.json({
      email,
      transactionCount,
      isEligibleForPromo,
      promoCode: isEligibleForPromo ? "PANDA20" : null,
      ordersUntilNextPromo,
    });

  } catch (error) {
    console.error("DEBUG: Error in promo handler:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
