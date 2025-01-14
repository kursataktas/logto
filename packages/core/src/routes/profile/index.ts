import { emailRegEx, phoneRegEx, usernameRegEx, UserScope } from '@logto/core-kit';
import { VerificationType, userProfileResponseGuard, userProfileGuard } from '@logto/schemas';
import { z } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';

import { EnvSet } from '../../env-set/index.js';
import RequestError from '../../errors/RequestError/index.js';
import { encryptUserPassword } from '../../libraries/user.utils.js';
import {
  buildVerificationRecordByIdAndType,
  verifyUserSensitivePermission,
} from '../../libraries/verification.js';
import assertThat from '../../utils/assert-that.js';
import { PasswordValidator } from '../experience/classes/libraries/password-validator.js';
import type { UserRouter, RouterInitArgs } from '../types.js';

import { getScopedProfile } from './utils/get-scoped-profile.js';

export default function profileRoutes<T extends UserRouter>(
  ...[router, { queries, libraries }]: RouterInitArgs<T>
) {
  const {
    users: { updateUserById, findUserById, deleteUserIdentity },
    signInExperiences: { findDefaultSignInExperience },
  } = queries;

  const {
    users: { checkIdentifierCollision },
  } = libraries;

  if (!EnvSet.values.isDevFeaturesEnabled) {
    return;
  }

  router.get(
    '/profile',
    koaGuard({
      response: userProfileResponseGuard.partial(),
      status: [200],
    }),
    async (ctx, next) => {
      const { id: userId, scopes } = ctx.auth;
      ctx.body = await getScopedProfile(queries, libraries, scopes, userId);
      return next();
    }
  );

  router.patch(
    '/profile',
    koaGuard({
      body: z.object({
        name: z.string().nullable().optional(),
        avatar: z.string().url().nullable().optional(),
        username: z.string().regex(usernameRegEx).optional(),
      }),
      response: userProfileResponseGuard.partial(),
      status: [200, 400, 422],
    }),
    async (ctx, next) => {
      const { id: userId, scopes } = ctx.auth;
      const { body } = ctx.guard;
      const { name, avatar, username } = body;

      assertThat(scopes.has(UserScope.Profile), 'auth.unauthorized');

      if (username !== undefined) {
        await checkIdentifierCollision({ username }, userId);
      }

      const updatedUser = await updateUserById(userId, {
        name,
        avatar,
        username,
      });

      ctx.appendDataHookContext('User.Data.Updated', { user: updatedUser });

      ctx.body = await getScopedProfile(queries, libraries, scopes, userId);

      return next();
    }
  );

  router.patch(
    '/profile/profile',
    koaGuard({
      body: userProfileGuard,
      response: userProfileGuard,
      status: [200, 400],
    }),
    async (ctx, next) => {
      const { id: userId, scopes } = ctx.auth;
      const { body } = ctx.guard;

      assertThat(scopes.has(UserScope.Profile), 'auth.unauthorized');

      if (body.address !== undefined) {
        assertThat(scopes.has(UserScope.Address), 'auth.unauthorized');
      }

      const updatedUser = await updateUserById(userId, {
        profile: body,
      });

      ctx.appendDataHookContext('User.Data.Updated', { user: updatedUser });

      const profile = await getScopedProfile(queries, libraries, scopes, userId);
      ctx.body = profile.profile;

      return next();
    }
  );

  router.post(
    '/profile/password',
    koaGuard({
      body: z.object({ password: z.string().min(1), verificationRecordId: z.string() }),
      status: [204, 401, 422],
    }),
    async (ctx, next) => {
      const { id: userId } = ctx.auth;
      const { password, verificationRecordId } = ctx.guard.body;

      const user = await findUserById(userId);
      const signInExperience = await findDefaultSignInExperience();
      const passwordPolicyChecker = new PasswordValidator(signInExperience.passwordPolicy, user);
      await passwordPolicyChecker.validatePassword(password, user);

      await verifyUserSensitivePermission({
        userId,
        id: verificationRecordId,
        queries,
        libraries,
      });

      const { passwordEncrypted, passwordEncryptionMethod } = await encryptUserPassword(password);
      const updatedUser = await updateUserById(userId, {
        passwordEncrypted,
        passwordEncryptionMethod,
      });

      ctx.appendDataHookContext('User.Data.Updated', { user: updatedUser });

      ctx.status = 204;

      return next();
    }
  );

  router.post(
    '/profile/primary-email',
    koaGuard({
      body: z.object({
        email: z.string().regex(emailRegEx),
        verificationRecordId: z.string(),
        newIdentifierVerificationRecordId: z.string(),
      }),
      status: [204, 400, 401],
    }),
    async (ctx, next) => {
      const { id: userId, scopes } = ctx.auth;
      const { email, verificationRecordId, newIdentifierVerificationRecordId } = ctx.guard.body;

      assertThat(scopes.has(UserScope.Email), 'auth.unauthorized');

      await verifyUserSensitivePermission({
        userId,
        id: verificationRecordId,
        queries,
        libraries,
      });

      // Check new identifier
      const newVerificationRecord = await buildVerificationRecordByIdAndType({
        type: VerificationType.EmailVerificationCode,
        id: newIdentifierVerificationRecordId,
        queries,
        libraries,
      });
      assertThat(newVerificationRecord.isVerified, 'verification_record.not_found');
      assertThat(newVerificationRecord.identifier.value === email, 'verification_record.not_found');

      await checkIdentifierCollision({ primaryEmail: email }, userId);

      const updatedUser = await updateUserById(userId, { primaryEmail: email });

      ctx.appendDataHookContext('User.Data.Updated', { user: updatedUser });

      ctx.status = 204;

      return next();
    }
  );

  router.post(
    '/profile/primary-phone',
    koaGuard({
      body: z.object({
        phone: z.string().regex(phoneRegEx),
        verificationRecordId: z.string(),
        newIdentifierVerificationRecordId: z.string(),
      }),
      status: [204, 400, 401],
    }),
    async (ctx, next) => {
      const { id: userId, scopes } = ctx.auth;
      const { phone, verificationRecordId, newIdentifierVerificationRecordId } = ctx.guard.body;

      assertThat(scopes.has(UserScope.Phone), 'auth.unauthorized');

      await verifyUserSensitivePermission({
        userId,
        id: verificationRecordId,
        queries,
        libraries,
      });

      // Check new identifier
      const newVerificationRecord = await buildVerificationRecordByIdAndType({
        type: VerificationType.PhoneVerificationCode,
        id: newIdentifierVerificationRecordId,
        queries,
        libraries,
      });
      assertThat(newVerificationRecord.isVerified, 'verification_record.not_found');
      assertThat(newVerificationRecord.identifier.value === phone, 'verification_record.not_found');

      await checkIdentifierCollision({ primaryPhone: phone }, userId);

      const updatedUser = await updateUserById(userId, { primaryPhone: phone });

      ctx.appendDataHookContext('User.Data.Updated', { user: updatedUser });

      ctx.status = 204;

      return next();
    }
  );

  router.post(
    '/profile/identities',
    koaGuard({
      body: z.object({
        verificationRecordId: z.string(),
        newIdentifierVerificationRecordId: z.string(),
      }),
      status: [204, 400, 401],
    }),
    async (ctx, next) => {
      const { id: userId, scopes } = ctx.auth;
      const { verificationRecordId, newIdentifierVerificationRecordId } = ctx.guard.body;

      assertThat(scopes.has(UserScope.Identities), 'auth.unauthorized');

      await verifyUserSensitivePermission({
        userId,
        id: verificationRecordId,
        queries,
        libraries,
      });

      // Check new identifier
      const newVerificationRecord = await buildVerificationRecordByIdAndType({
        type: VerificationType.Social,
        id: newIdentifierVerificationRecordId,
        queries,
        libraries,
      });
      assertThat(newVerificationRecord.isVerified, 'verification_record.not_found');

      const {
        socialIdentity: { target, userInfo },
      } = await newVerificationRecord.toUserProfile();

      await checkIdentifierCollision({ identity: { target, id: userInfo.id } }, userId);

      const user = await findUserById(userId);

      assertThat(!user.identities[target], 'user.identity_already_in_use');

      const updatedUser = await updateUserById(userId, {
        identities: {
          ...user.identities,
          [target]: {
            userId: userInfo.id,
            details: userInfo,
          },
        },
      });

      ctx.appendDataHookContext('User.Data.Updated', { user: updatedUser });

      ctx.status = 204;

      return next();
    }
  );

  router.delete(
    '/profile/identities/:target',
    koaGuard({
      params: z.object({ target: z.string() }),
      query: z.object({
        // TODO: Move all sensitive permission checks to the header
        verificationRecordId: z.string(),
      }),
      status: [204, 400, 401, 404],
    }),
    async (ctx, next) => {
      const { id: userId, scopes } = ctx.auth;
      const { verificationRecordId } = ctx.guard.query;
      const { target } = ctx.guard.params;
      assertThat(scopes.has(UserScope.Identities), 'auth.unauthorized');

      await verifyUserSensitivePermission({
        userId,
        id: verificationRecordId,
        queries,
        libraries,
      });

      const user = await findUserById(userId);

      assertThat(
        user.identities[target],
        new RequestError({
          code: 'user.identity_not_exist',
          status: 404,
        })
      );

      const updatedUser = await deleteUserIdentity(userId, target);

      ctx.appendDataHookContext('User.Data.Updated', { user: updatedUser });

      ctx.status = 204;

      return next();
    }
  );
}
