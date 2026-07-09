import * as migration_20260613_175732 from './20260613_175732';
import * as migration_20260617_213630 from './20260617_213630';
import * as migration_20260625_015310 from './20260625_015310';
import * as migration_20260629_223908 from './20260629_223908';
import * as migration_20260709_210403 from './20260709_210403';

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
    name: '20260625_015310',
  },
  {
    up: migration_20260629_223908.up,
    down: migration_20260629_223908.down,
    name: '20260629_223908',
  },
  {
    up: migration_20260709_210403.up,
    down: migration_20260709_210403.down,
    name: '20260709_210403'
  },
];
