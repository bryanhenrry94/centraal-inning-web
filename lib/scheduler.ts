import cron from "node-cron";
import fetch from "node-fetch";
import { protocol, rootDomain } from "./config";

export function startJobScheduler() {
  const apiUrl =
    process.env.JOBS_RUN_URL ||
    `${protocol}://${rootDomain}/api/jobs/run-all?token=${process.env.CRON_SECRET_TOKEN}`;

  cron.schedule("*/60 * * * *", async () => {
    console.log("🔁 Ejecutando job programado:", new Date().toISOString());

    try {
      await fetch(apiUrl);
    } catch (error) {
      console.error("❌ Error ejecutando job:", error);
    }
  });

  console.log("🕒 Scheduler inicializado");
}
