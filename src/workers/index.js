import startMovieFetcherWorker from "./movieFetcherWorker.js";
import startNotificationWorker from "./notificationWorker.js";
import startMailWorker from "./mailWorker.js";

export async function startWorkers() {
  console.log("starting workers");
  await startMovieFetcherWorker();
  await startNotificationWorker();
  await startMailWorker();
  console.log("workers started");
}
