import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table applications
      add column is_visible boolean not null default true;
    `);

    await pool.query(sql`
      alter table applications 
      add constraint check_visibility_rules 
      check (
        (is_third_party = true) OR  -- Third-party applications can set any visibility
        (is_visible = true)         -- Non-third-party applications must remain visible
      );
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table applications 
      drop constraint check_visibility_rules;
    `);
    await pool.query(sql`
      alter table applications 
      drop column is_visible;
    `);
  },
};

export default alteration;
