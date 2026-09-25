import * as migration_20260925_111836_initial from './20260925_111836_initial';

export const migrations = [
  {
    up: migration_20260925_111836_initial.up,
    down: migration_20260925_111836_initial.down,
    name: '20260925_111836_initial'
  },
];
