import startMovieFetcherWorker from "./movieFetcherWorker.js";

export async function startWorkers() {
  console.log("starting workers");
  await startMovieFetcherWorker();
  console.log("workers started");
}
