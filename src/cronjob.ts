import { CronJob } from 'cron';
import { sync } from './profilePageSyncer';

const cronjob = new CronJob(
  '0 * * * * *',
  () => {
    sync()
      .then((successCount) => console.log(`created ${successCount} new profile page(s)`));
  },
);
cronjob.start();
console.log('cronjob started');
