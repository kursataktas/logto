import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter type application_type add value if not exists 'SAML';
    `);

    await pool.query(sql`
      alter table applications 
        add constraint check_saml_app_third_party_consistency 
        check (type != 'SAML' OR (type = 'SAML' AND is_third_party = true));
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table applications 
        drop constraint if exists check_saml_app_third_party_consistency;

      delete from applications where type = 'SAML';
    `);

    await pool.query(sql`
      create type application_type_new as enum ('Native', 'SPA', 'Traditional', 'MachineToMachine', 'Protected');

      alter table applications 
        alter column type type application_type_new 
        using type::text::application_type_new;

      drop type application_type;

      alter type application_type_new rename to application_type;
    `);
  },
};

export default alteration;
