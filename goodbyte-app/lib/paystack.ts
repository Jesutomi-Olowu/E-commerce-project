const BASE = "https://api.paystack.co";

export async function initializeTransaction(input: {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl: string;
}) {
  const res = await fetch(`${BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: input.email,
      amount: input.amountKobo,
      currency: "NGN",
      reference: input.reference,
      callback_url: input.callbackUrl,
    }),
  });
  const json = await res.json();
  if (!res.ok || !json.status) throw new Error(`Paystack init failed: ${json.message}`);
  return json.data as { authorization_url: string; reference: string };
}
