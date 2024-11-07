import { ApplicationType } from '@logto/schemas';
import { HTTPError } from 'ky';

import {
  createApplication,
  deleteApplication,
  getApplication,
  getApplications,
  updateApplication,
} from '#src/api/index.js';
import { expectRejects } from '#src/helpers/index.js';

describe('application APIs', () => {
  it('should create application successfully', async () => {
    const applicationName = 'test-create-app';
    const applicationType = ApplicationType.SPA;
    const application = await createApplication(applicationName, applicationType);

    expect(application.name).toBe(applicationName);
    expect(application.type).toBe(applicationType);
    expect(application.isThirdParty).toBe(false);

    const fetchedApplication = await getApplication(application.id);

    expect(fetchedApplication.name).toBe(applicationName);
    expect(fetchedApplication.id).toBe(application.id);
  });

  it('should throw error when creating an OIDC third party application with invalid type', async () => {
    await expectRejects(
      createApplication('test-create-app', ApplicationType.Native, {
        isThirdParty: true,
      }),
      { code: 'application.invalid_third_party_application_type', status: 400 }
    );
  });

  it('should throw error when creating a non-third party SAML application', async () => {
    await expectRejects(
      createApplication('test-create-saml-app', ApplicationType.SAML, {
        isThirdParty: false,
      }),
      { code: 'application.saml_app_should_always_be_third_party', status: 400 }
    );
  });

  it('should throw error when creating a SAML application with OIDC client metadata specified', async () => {
    await expectRejects(
      createApplication('test-create-saml-app', ApplicationType.SAML, {
        isThirdParty: true,
        oidcClientMetadata: {
          redirectUris: ['https://example.com'],
          postLogoutRedirectUris: ['https://example.com'],
        },
      }),
      { code: 'application.should_not_specify_saml_app_oidc_client_metadata', status: 400 }
    );
  });

  it('should create SAML third party application successfully and can not be updated with PATCH', async () => {
    const samlApplication = await createApplication('test-create-saml-app', ApplicationType.SAML, {
      isThirdParty: true,
    });

    expect(samlApplication.type).toBe(ApplicationType.SAML);
    expect(samlApplication.isThirdParty).toBe(true);

    await expectRejects(
      updateApplication(samlApplication.id, {
        name: 'test-update-saml-app',
      }),
      { code: 'application.saml_app_cannot_be_updated_with_patch', status: 400 }
    );

    await deleteApplication(samlApplication.id);
  });

  it('should create OIDC third party application successfully', async () => {
    const applicationName = 'test-third-party-app';

    const application = await createApplication(applicationName, ApplicationType.Traditional, {
      isThirdParty: true,
    });

    expect(application.name).toBe(applicationName);
    expect(application.type).toBe(ApplicationType.Traditional);
    expect(application.isThirdParty).toBe(true);
    await deleteApplication(application.id);
  });

  it('should create protected application successfully', async () => {
    const applicationName = 'test-protected-app';
    const metadata = {
      origin: 'https://example.com',
      subDomain: 'example',
    };

    const application = await createApplication(applicationName, ApplicationType.Protected, {
      protectedAppMetadata: metadata,
    });

    expect(application.name).toBe(applicationName);
    expect(application.type).toBe(ApplicationType.Protected);
    expect(application.protectedAppMetadata).toHaveProperty('origin', metadata.origin);
    expect(application.protectedAppMetadata?.host).toContain(metadata.subDomain);
    expect(application.protectedAppMetadata).toHaveProperty('sessionDuration');
    await deleteApplication(application.id);
  });

  it('should throw error when creating protected application with existing subdomain', async () => {
    const applicationName = 'test-protected-app';
    const metadata = {
      origin: 'https://example.com',
      subDomain: 'example',
    };

    const application = await createApplication(applicationName, ApplicationType.Protected, {
      protectedAppMetadata: metadata,
    });
    await expectRejects(
      createApplication('test-create-app', ApplicationType.Protected, {
        protectedAppMetadata: metadata,
      }),
      {
        code: 'application.protected_application_subdomain_exists',
        status: 422,
      }
    );
    await deleteApplication(application.id);
  });

  it('should throw error when creating a protected application with invalid type', async () => {
    await expectRejects(createApplication('test-create-app', ApplicationType.Protected), {
      code: 'application.protected_app_metadata_is_required',
      status: 400,
    });
  });

  it('should update application details successfully', async () => {
    const application = await createApplication('test-update-app', ApplicationType.Traditional);

    const newApplicationDescription = `new_${application.description ?? ''}`;

    const newRedirectUris = application.oidcClientMetadata.redirectUris.concat([
      'https://logto.dev/callback',
    ]);

    await updateApplication(application.id, {
      description: newApplicationDescription,
      oidcClientMetadata: {
        ...application.oidcClientMetadata,
        redirectUris: newRedirectUris,
      },
      customClientMetadata: { rotateRefreshToken: true, refreshTokenTtlInDays: 10 },
    });

    const updatedApplication = await getApplication(application.id);

    expect(updatedApplication.description).toBe(newApplicationDescription);
    expect(updatedApplication.oidcClientMetadata.redirectUris).toEqual(newRedirectUris);
    expect({ ...updatedApplication.customClientMetadata }).toStrictEqual({
      rotateRefreshToken: true,
      refreshTokenTtlInDays: 10,
    });
  });

  it('should update application details for protected app successfully', async () => {
    const metadata = {
      origin: 'https://example.com',
      subDomain: 'example',
    };

    const application = await createApplication('test-update-app', ApplicationType.Protected, {
      protectedAppMetadata: metadata,
    });

    const newApplicationDescription = `new_${application.description ?? ''}`;

    const newOrigin = 'https://example2.com';

    await updateApplication(application.id, {
      description: newApplicationDescription,
      protectedAppMetadata: { origin: newOrigin },
    });

    const updatedApplication = await getApplication(application.id);

    expect(updatedApplication.description).toBe(newApplicationDescription);
    expect(updatedApplication.protectedAppMetadata?.origin).toEqual(newOrigin);
  });

  it('should update application "admin" successfully', async () => {
    const application = await createApplication(
      'test-update-is-admin',
      ApplicationType.MachineToMachine
    );
    await updateApplication(application.id, {
      isAdmin: true,
    });
    const updatedApplication = await getApplication(application.id);
    expect(updatedApplication.isAdmin).toBeTruthy();

    await updateApplication(application.id, {
      isAdmin: false,
    });
    const updatedAgainApplication = await getApplication(application.id);
    expect(updatedAgainApplication.isAdmin).toBeFalsy();
  });

  it('should get demo app application successfully', async () => {
    const application = await getApplication('demo-app');
    expect(application.id).toBe('demo-app');
  });

  it('should fetch all non-third party applications created above', async () => {
    const applications = await getApplications(undefined, undefined, 'false');

    const applicationNames = applications.map(({ name }) => name);
    expect(applicationNames).toContain('test-create-app');
    expect(applicationNames).toContain('test-update-app');

    expect(applications.some(({ isThirdParty }) => isThirdParty)).toBe(false);
  });

  it('should fetch all third party applications created', async () => {
    const application = await createApplication(
      'test-third-party-app',
      ApplicationType.Traditional,
      {
        isThirdParty: true,
      }
    );

    const applications = await getApplications(undefined, undefined, 'true');

    expect(applications.find(({ id }) => id === application.id)).toEqual(application);
    expect(applications.some(({ isThirdParty }) => !isThirdParty)).toBe(false);
    await deleteApplication(application.id);
  });

  it('should fetch all applications including third party applications', async () => {
    const application = await createApplication(
      'test-third-party-app',
      ApplicationType.Traditional,
      {
        isThirdParty: true,
      }
    );

    const applications = await getApplications();
    const applicationNames = applications.map(({ name }) => name);

    expect(applicationNames).toContain('test-create-app');
    expect(applicationNames).toContain('test-update-app');
    expect(applicationNames).toContain('test-third-party-app');

    await deleteApplication(application.id);
  });

  it('should create m2m application successfully and can get only m2m applications by specifying types', async () => {
    await createApplication('test-m2m-app-1', ApplicationType.MachineToMachine);
    await createApplication('test-m2m-app-2', ApplicationType.MachineToMachine);
    const m2mApps = await getApplications([ApplicationType.MachineToMachine]);
    const m2mAppNames = m2mApps.map(({ name }) => name);
    expect(m2mAppNames).toContain('test-m2m-app-1');
    expect(m2mAppNames).toContain('test-m2m-app-2');
  });

  it('total number of apps should equal to the sum of number of each types', async () => {
    const allApps = await getApplications();
    const m2mApps = await getApplications([ApplicationType.MachineToMachine]);
    const spaApps = await getApplications([ApplicationType.SPA]);
    const otherApps = await getApplications([
      ApplicationType.Native,
      ApplicationType.Traditional,
      ApplicationType.Protected,
    ]);
    expect(allApps.length).toBe(m2mApps.length + spaApps.length + otherApps.length);
    const allAppNames = allApps.map(({ name }) => name);
    const spaAppNames = spaApps.map(({ name }) => name);
    const otherAppNames = otherApps.map(({ name }) => name);
    expect(allAppNames).toContain('test-m2m-app-1');
    expect(allAppNames).toContain('test-m2m-app-2');
    expect(spaAppNames).not.toContain('test-m2m-app-1');
    expect(spaAppNames).not.toContain('test-m2m-app-2');
    expect(otherAppNames).not.toContain('test-m2m-app-1');
    expect(otherAppNames).not.toContain('test-m2m-app-2');
  });

  it('should delete application successfully', async () => {
    const application = await createApplication('test-delete-app', ApplicationType.Native);

    await deleteApplication(application.id);

    const response = await getApplication(application.id).catch((error: unknown) => error);
    expect(response instanceof HTTPError && response.response.status === 404).toBe(true);
  });
});
