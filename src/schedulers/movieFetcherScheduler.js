import moviesFetchQueue from "../queues/moviesQueue.js";
import movieFetcherWorker from "../workers/movieFetcherWorker.js";

const movieFetcherScheduler = async () => {
  console.log("movieFetcherScheduler");
  await moviesFetchQueue.add(
    "moviesFetchQueue",
    {},
    {
      repeat: {
        every: 1000 * 60 * 60, //1hr
      },
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: true,
      },
    }
  );

  console.log("Scheduled email job added to the queue.");
};

movieFetcherWorker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

movieFetcherWorker.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed with error: ${err.message}`);
});

export default movieFetcherScheduler;
