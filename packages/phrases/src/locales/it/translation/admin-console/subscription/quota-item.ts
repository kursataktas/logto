const quota_item = {
  tenant_limit: {
    name: 'Tenanti',
    limited: '{{count, number}} affittuario',
    limited_other: '{{count, number}} affittuari',
    unlimited: 'Affittuari illimitati',
    not_eligible: 'Rimuovi i tuoi affittuari',
  },
  mau_limit: {
    name: 'Utenti attivi mensili',
    limited: '{{count, number}} MAU',
    unlimited: 'Utenti attivi mensili illimitati',
    not_eligible: 'Rimuovi tutti i tuoi utenti',
  },
  token_limit: {
    name: 'Tokens',
    limited: '{{count, number}} token',
    limited_other: '{{count, number}} tokens',
    unlimited: 'Tokens illimitati',
    not_eligible: 'Rimuovi tutti i tuoi utenti per prevenire i nuovi tokens',
  },
  applications_limit: {
    name: 'Applicazioni',
    limited: '{{count, number}} applicazione',
    limited_other: '{{count, number}} applicazioni',
    unlimited: 'Applicazioni illimitate',
    not_eligible: 'Rimuovi le tue applicazioni',
  },
  machine_to_machine_limit: {
    name: 'Applicazioni Machine-to-Machine',
    limited: '{{count, number}} applicazione Machine-to-Machine',
    limited_other: '{{count, number}} applicazioni Machine-to-Machine',
    unlimited: 'Applicazioni Machine-to-Machine illimitate',
    not_eligible: 'Rimuovi le tue applicazioni Machine-to-Machine',
  },
  third_party_applications_limit: {
    /** UNTRANSLATED */
    name: 'Third-party apps',
    /** UNTRANSLATED */
    limited: '{{count, number}} third-party app',
    /** UNTRANSLATED */
    limited_other: '{{count, number}} third-party apps',
    /** UNTRANSLATED */
    unlimited: 'Unlimited third-party apps',
    /** UNTRANSLATED */
    not_eligible: 'Remove your third-party apps',
  },
  resources_limit: {
    name: 'Risorse API',
    limited: '{{count, number}} risorsa API',
    limited_other: '{{count, number}} risorse API',
    unlimited: 'Risorse API illimitate',
    not_eligible: 'Rimuovi le tue risorse API',
  },
  scopes_per_resource_limit: {
    name: 'Permessi risorsa',
    limited: '{{count, number}} permesso per risorsa',
    limited_other: '{{count, number}} permessi per risorsa',
    unlimited: 'Permesso per risorsa illimitato',
    not_eligible: 'Rimuovi i permessi risorsa',
  },
  custom_domain_enabled: {
    name: 'Dominio personalizzato',
    limited: 'Dominio personalizzato',
    unlimited: 'Dominio personalizzato',
    not_eligible: 'Rimuovi il tuo dominio personalizzato',
  },
  omni_sign_in_enabled: {
    name: 'Omnisign-in',
    limited: 'Omnisign-in',
    unlimited: 'Omnisign-in',
    not_eligible: 'Disabilita il tuo Omnisign-in',
  },
  built_in_email_connector_enabled: {
    name: 'Connettore email incorporato',
    limited: 'Connettore email incorporato',
    unlimited: 'Connettore email incorporato',
    not_eligible: 'Rimuovi il tuo connettore email incorporato',
  },
  social_connectors_limit: {
    name: 'Connettori sociali',
    limited: '{{count, number}} connettore sociale',
    limited_other: '{{count, number}} connettori sociali',
    unlimited: 'Connettori sociali illimitati',
    not_eligible: 'Rimuovi i tuoi connettori sociali',
  },
  standard_connectors_limit: {
    name: 'Connettori standard gratuiti',
    limited: '{{count, number}} connettore standard gratuito',
    limited_other: '{{count, number}} connettori standard gratuiti',
    unlimited: 'Connettori standard illimitati',
    not_eligible: 'Rimuovi i tuoi connettori standard',
  },
  roles_limit: {
    name: 'Ruoli',
    limited: '{{count, number}} ruolo',
    limited_other: '{{count, number}} ruoli',
    unlimited: 'Ruoli illimitati',
    not_eligible: 'Rimuovi i tuoi ruoli',
  },
  machine_to_machine_roles_limit: {
    name: 'Ruoli di applicazione Machine-to-Machine',
    limited: '{{count, number}} ruolo di applicazione Machine-to-Machine',
    limited_other: '{{count, number}} ruoli di applicazione Machine-to-Machine',
    unlimited: 'Ruoli di applicazione Machine-to-Machine illimitati',
    not_eligible: 'Rimuovi i tuoi ruoli di applicazione Machine-to-Machine',
  },
  scopes_per_role_limit: {
    name: 'Permessi ruolo',
    limited: '{{count, number}} permesso per ruolo',
    limited_other: '{{count, number}} permessi per ruolo',
    unlimited: 'Permesso per ruolo illimitato',
    not_eligible: 'Rimuovi i permessi ruolo',
  },
  hooks_limit: {
    name: 'Webhooks',
    limited: '{{count, number}} webhook',
    limited_other: '{{count, number}} webhooks',
    unlimited: 'Webhook illimitati',
    not_eligible: 'Rimuovi i tuoi webhook',
  },
  organizations_enabled: {
    name: 'Organizzazioni',
    limited: 'Organizzazioni',
    unlimited: 'Organizzazioni',
    not_eligible: 'Rimuovi le tue organizzazioni',
  },
  audit_logs_retention_days: {
    name: 'Conservazione log di audit',
    limited: 'Conservazione log di audit: {{count, number}} giorno',
    limited_other: 'Conservaizone log di audit: {{count, number}} giorni',
    unlimited: 'Giorni illimitati',
    not_eligible: 'Nessun log di audit',
  },
  email_ticket_support: {
    name: 'Supporto tramite ticket email',
    limited: '{{count, number}} ora di supporto tramite ticket email',
    limited_other: '{{count, number}} ore di supporto tramite ticket email',
    unlimited: 'Supporto tramite ticket email',
    not_eligible: 'Nessun supporto tramite ticket email',
  },
  mfa_enabled: {
    name: 'Autenticazione a due fattori',
    limited: 'Autenticazione a due fattori',
    unlimited: 'Autenticazione a due fattori',
    not_eligible: 'Rimuovi la tua autenticazione a due fattori',
  },
  sso_enabled: {
    name: 'SSO aziendale',
    limited: 'SSO aziendale',
    unlimited: 'SSO aziendale',
    not_eligible: 'Rimuovi il tuo SSO aziendale',
  },
  tenant_members_limit: {
    /** UNTRANSLATED */
    name: 'Tenant members',
    /** UNTRANSLATED */
    limited: '{{count, number}} tenant member',
    /** UNTRANSLATED */
    limited_other: '{{count, number}} tenant members',
    /** UNTRANSLATED */
    unlimited: 'Unlimited tenant members',
    /** UNTRANSLATED */
    not_eligible: 'Remove your tenant members',
  },
  custom_jwt_enabled: {
    /** UNTRANSLATED */
    name: 'Custom JWT',
    /** UNTRANSLATED */
    limited: 'Custom JWT',
    /** UNTRANSLATED */
    unlimited: 'Custom JWT',
    /** UNTRANSLATED */
    not_eligible: 'Remove your JWT claims customizer',
  },
};

export default Object.freeze(quota_item);
