import type { Plugin } from '@nocobase/server';
import dayjs from 'dayjs';

interface ITokenInfo {
  userId: number;
  issueAt: dayjs.Dayjs;
  clientId: any;
}

export const implementTokenCheckMiddleware = (plugin: Plugin) => {
  const { app } = plugin;
  const { db } = app;
  // app.resourcer.use(tokenCheck(plugin), { after: 'parseToken', before: 'checkRole' });

  const userTokenAuthMap = new Map<number, ITokenInfo>();

  app.on('ws:message:auth:token', async ({ clientId, payload }) => {
    if (!payload || !payload.token || !payload.authenticator) {
      return;
    }

    const auth = await app.authManager.get(payload.authenticator, {
      getBearerToken: () => payload.token,
      app: app,
      db: app.db,
      cache: app.cache,
      logger: app.logger,
      log: app.log,
    } as any);

    const token = payload.token;
    const { userId, iat: _issueAt } = await app.authManager.jwt.decode(token);
    const issueAt = dayjs.unix(_issueAt);
    const usersRepo = db.getRepository('users');
    const currentUsers: { id: number; roles: any[] } = await usersRepo.findOne({
      filterByTk: userId,
      appends: ['roles'],
    });

    const isRootOrAdmin = currentUsers.roles.some((r) => {
      const roleName = r.dataValues.name;
      return roleName === 'root' || roleName === 'admin';
    });

    if (isRootOrAdmin) return;

    const forceClientOffline = (cid: any) => {
      setTimeout(() => {
        app.emit('ws:sendToClient', {
          clientId: cid,
          message: {
            type: 'force-offline',
            payload: {},
          },
        });
      }, 3000);
    };

    const addCurrentToMap = () => {
      userTokenAuthMap.set(userId, { issueAt, userId, clientId });
    };

    if (!userTokenAuthMap.has(userId)) {
      addCurrentToMap();
    } else {
      const { clientId: cid, issueAt: existIssueAt } = userTokenAuthMap.get(userId);
      let forceClientId: any;
      if (existIssueAt.isAfter(issueAt)) {
        forceClientId = clientId;
      } else {
        forceClientId = cid;
        addCurrentToMap();
      }
      forceClientOffline(forceClientId);
    }
  });
};
