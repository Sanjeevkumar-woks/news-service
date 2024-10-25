import cron from "node-cron";

//function that clears the stored news articles older than 24 hours
function startNewsCleanCron() {
  cron.schedule("* * * * *", async () => {
    await NewsArticle.deleteMany({
      createdAt: { $lte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });
  });
}

export default startNewsCleanCron;
