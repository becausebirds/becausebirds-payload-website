import * as migration_20260613_175732 from './20260613_175732';
import * as migration_20260617_213630 from './20260617_213630';
import * as migration_20260625_015310 from './20260625_015310';

export const migrations = [
  {
    up: migration_20260613_175732.up,
    down: migration_20260613_175732.down,
    name: '20260613_175732',
  },
  {
    up: migration_20260617_213630.up,
    down: migration_20260617_213630.down,
    name: '20260617_213630',
  },
  {
    up: migration_20260625_015310.up,
    down: migration_20260625_015310.down,
    name: '20260625_015310'
  },
];
