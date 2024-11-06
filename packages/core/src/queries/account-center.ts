import { type AccountCenter, AccountCenters } from '@logto/schemas';
import { sql, type CommonQueryMethods } from '@silverhand/slonik';

import { buildInsertIntoWithPool } from '#src/database/insert-into.js';
import { convertToIdentifiers } from '#src/utils/sql.js';

import { buildFindEntityByIdWithPool } from '../database/find-entity-by-id.js';
import { buildUpdateWhereWithPool } from '../database/update-where.js';

const { table, fields } = convertToIdentifiers(AccountCenters);

const defaultAccountCenter: Omit<AccountCenter, 'tenantId'> = {
  id: 'default',
  enabled: false,
  fields: {},
};

export class AccountCenterQueries {
  public readonly insert = buildInsertIntoWithPool(this.pool)(AccountCenters, {
    returning: true,
  });

  public readonly update = buildUpdateWhereWithPool(this.pool)(AccountCenters, true);

  public readonly find = buildFindEntityByIdWithPool(this.pool)(AccountCenters);

  constructor(public readonly pool: CommonQueryMethods) {}

  /**
   * For now, each tenant has only one account center with the id 'default'.
   * @returns The default account center. If it does not exist, it will be created.
   */
  public findDefaultAccountCenter = async () => {
    const accountCenter = await this.pool.maybeOne<AccountCenter>(sql`
      select * from ${table}
      where ${fields.id} = ${defaultAccountCenter.id}
    `);

    if (accountCenter) {
      return accountCenter;
    }

    await this.insert(defaultAccountCenter);

    return this.find(defaultAccountCenter.id);
  };

  /**
   * Update the default account center, should make sure the default account center exists.
   */
  public updateDefaultAccountCenter = async (accountCenter: Partial<AccountCenter>) => {
    return this.update({
      where: { id: defaultAccountCenter.id },
      set: accountCenter,
      jsonbMode: 'replace',
    });
  };
}
