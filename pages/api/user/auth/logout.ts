import cors from "../../../../lib/cors-middleware";


export default async function handler(req, res) {
  await cors(req, res);
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  res.status(200).json({ message: "Logout exitoso" });
}