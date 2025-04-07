import type { Application, Plugin } from '@nocobase/server';
import dayjs from 'dayjs';
import { isNil } from 'lodash';

export interface ITokenInfo {
  userId: number;
  organizationId: number;
  issueAt: dayjs.Dayjs;
  clientId: string;
  token: string;
}

export const UserOnlineRecorder = (() => {
  const userTokenAuthMap = new Map<number, ITokenInfo>();
  const organClients = new Map<number, Set<string>>();
  const clientToUserMap = new Map<string, number>();
  /**
   * 记录在线用户token状态
   * @param props
   */
  const recordUserOnline = (props: ITokenInfo) => {
    const { userId, organizationId, clientId } = props;

    const clientSet = organClients.get(organizationId) || new Set<string>();
    // 如果用户直接刷新浏览器,那么会造成旧的clientId未清理
    const oldInfo = userTokenAuthMap.get(userId);
    if (!isNil(oldInfo)) {
      recordUserOffline(oldInfo.clientId);
    }

    userTokenAuthMap.set(userId, props);
    clientSet.add(clientId);
    organClients.set(organizationId, clientSet);
    clientToUserMap.set(clientId, userId);
    // console.log(`---------[ online ]---------`);
    // console.log(`userTokenAuthMap:`, userTokenAuthMap);
    // console.log(`organClients:`, organClients);
    // console.log(`clientToUserMap:`, clientToUserMap);
  };

  /**
   * 记录用户离线状态
   * @param userId
   */
  const recordUserOffline = (clientId: string) => {
    if (!clientToUserMap.has(clientId)) return;
    const userId = clientToUserMap.get(clientId);
    clientToUserMap.delete(clientId);
    const info = userTokenAuthMap.get(userId);
    const { organizationId } = info;
    const clientSet = organClients.get(organizationId) || new Set<string>();
    clientSet.delete(clientId);
    organClients.set(organizationId, clientSet);
    userTokenAuthMap.delete(userId);

    // console.log(`---------[ offline ]---------`);
    // console.log(`userTokenAuthMap:`, userTokenAuthMap);
    // console.log(`organClients:`, organClients);
    // console.log(`clientToUserMap:`, clientToUserMap);
  };

  const forceOfflineAllOrganClients = (props: { organizationId: number; app: Application }) => {
    const { app, organizationId } = props;
    // console.log(`---------[ forceOfflineAllOrganClients ]---------`);
    // console.log(`userTokenAuthMap:`, userTokenAuthMap);
    // console.log(`organClients:`, organClients);
    // console.log(`clientToUserMap:`, clientToUserMap);
    if (isNil(organizationId)) return;
    const clientSet = organClients.get(organizationId);
    if (isNil(clientSet)) return;
    for (const clientId of clientSet) {
      app.emit('ws:sendToClient', {
        clientId,
        message: {
          type: 'force-offline',
          payload: {},
        },
      });
      const userId = clientToUserMap.get(clientId);
      userTokenAuthMap.delete(userId);
      clientToUserMap.delete(clientId);
    }
    organClients.delete(organizationId);
  };

  /**
   * 获取在线用户token信息
   * @param userId
   * @returns
   */
  const getOnlineInfo = (userId: number) => {
    return userTokenAuthMap.get(userId);
  };

  /**
   * 判断用户是否在线
   * @param userId
   * @returns
   */
  const isUserOnline = (userId: number) => {
    return userTokenAuthMap.has(userId);
  };

  return {
    recordUserOnline,
    recordUserOffline,
    isUserOnline,
    getOnlineInfo,
    forceOfflineAllOrganClients,
  };
})();

export const implementPermissionMiddleware = (plugin: Plugin) => {
  const { app } = plugin;
  const { db } = app;

  // 监听用户登录和离线,记录相应信息
  app.on('ws:message:auth:token', async ({ clientId, payload }) => {
    if (!payload || !payload.token || !payload.authenticator) {
      UserOnlineRecorder.recordUserOffline(clientId);
      return;
    }

    // const auth = await app.authManager.get(payload.authenticator, {
    //   getBearerToken: () => payload.token,
    //   app: app,
    //   db: app.db,
    //   cache: app.cache,
    //   logger: app.logger,
    //   log: app.log,
    // } as any);

    const token = payload.token;
    const { userId, iat: _issueAt } = await app.authManager.jwt.decode(token);
    const issueAt = dayjs.unix(_issueAt);
    const usersRepo = db.getRepository('users');
    const currentUser: { id: number; roles: any[]; organizationId: number } = await usersRepo.findOne({
      filterByTk: userId,
      appends: ['roles'],
    });

    const isRootOrAdmin = currentUser.roles.some((r) => {
      const roleName = r.dataValues.name;
      return roleName === 'root' || roleName === 'admin';
    });

    if (isRootOrAdmin) return;

    const forceClientOffline = (cid: any) => {
      setTimeout(() => {
        UserOnlineRecorder.recordUserOffline(cid);
        app.emit('ws:sendToClient', {
          clientId: cid,
          message: {
            type: 'force-offline',
            payload: {},
          },
        });
      }, 3000);
    };

    const emitMessageToClient = (cid: any, message: string | string[], messageKey: string) => {
      setTimeout(() => {
        app.emit('ws:sendToClient', {
          clientId: cid,
          message: {
            type: 'custom-notification',
            payload: {
              message,
              messageKey,
            },
          },
        });
      }, 3000);
    };

    const currentTime = dayjs();
    const currentTimeStr = currentTime.format('YYYY-MM-DD HH:mm:ss');
    // 检查用户套餐信息,如果过期,退出登录
    const organizationId = currentUser.organizationId;
    console.log(`organizationId:`, organizationId);
    const organServicePackageRepo = db.getRepository('organizationServicePackage');
    const expiredPackages: any[] = await organServicePackageRepo.find({
      filter: {
        $and: [{ expirationDate: { $dateBefore: currentTimeStr } }, { organizationId: { $eq: organizationId } }],
      },
    });
    // console.log(`expiredPackages:`, expiredPackages);
    if (expiredPackages.length) {
      forceClientOffline(clientId);
      return;
    }

    // 检查一下套餐是不是准备过期
    const nearExpiredPackages: any[] = await organServicePackageRepo.find({
      filter: {
        $and: [
          { expirationDate: { $dateAfter: currentTimeStr } },
          { expirationDate: { $dateBefore: currentTime.add(7, 'day').format('YYYY-MM-DD HH:mm:ss') } },
          { organizationId: { $eq: organizationId } },
        ],
      },
    });
    // console.log(`nearExpiredPackages:`, nearExpiredPackages);
    if (nearExpiredPackages && nearExpiredPackages.length) {
      const message = [`以下套餐即将过期,请及时续费:`];
      for (const pck of nearExpiredPackages) {
        message.push(`${pck.name}:剩余 ${-currentTime.diff(pck.expirationDate, 'day')} 天`);
      }

      emitMessageToClient(clientId, message, `套餐即将到期通知/organizationId:${organizationId}`);
    }

    const addCurrentToMap = () => {
      UserOnlineRecorder.recordUserOnline({
        userId,
        issueAt,
        clientId,
        organizationId: currentUser.organizationId,
        token,
      });
    };

    if (!UserOnlineRecorder.isUserOnline(userId)) {
      addCurrentToMap();
    } else {
      const { clientId: cid, issueAt: existIssueAt, token: existToken } = UserOnlineRecorder.getOnlineInfo(userId);
      if (existToken === token) return;
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
