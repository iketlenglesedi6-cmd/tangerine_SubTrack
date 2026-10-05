#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/384dae2cab3fcc75ac5de8d5f0e51fe7f6773b7ca12d312f27a8e34abc0ac280/contract';
import endContract from '../../snapshots/384dae2cab3fcc75ac5de8d5f0e51fe7f6773b7ca12d312f27a8e34abc0ac280/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/e3929986ba91ef677877d68935818ef5268eb887e4633b7733d70040ef149a83/contract';
import startContract from '../../snapshots/e3929986ba91ef677877d68935818ef5268eb887e4633b7733d70040ef149a83/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, lit } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'subscription',
        column: col('currency', 'text', {
          notNull: true,
          default: lit('USD'),
          codecRef: { codecId: 'pg/text@1' },
        }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
