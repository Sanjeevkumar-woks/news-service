// import moviesFetchQueue from "../queues/moviesQueue.js";

// // Movie Fetcher Scheduler using buuMq repeatable jobs
// const movieFetcherScheduler = async () => {
//   console.log("movieFetcherScheduler");

//   // Remove existing repeatable jobs to ensure only the latest schedule is active
//   await moviesFetchQueue.obliterate({ force: true });

//   // Now, add a new repeatable job with the desired configuration
//   await moviesFetchQueue.add(
//     "moviesFetchQueue",
//     {},
//     {
//       repeat: {
//         every: 1000 * 60 * 5, //every 5 minute
//       },
//       removeOnComplete: true,
//       removeOnFail: true,
//     }
//   );
//   console.log("Scheduled movies fetch job added to the queue.");
// };

// export default movieFetcherScheduler;
