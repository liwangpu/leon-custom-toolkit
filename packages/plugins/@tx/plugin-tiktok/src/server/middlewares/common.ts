import { isNil, pick } from 'lodash';
import { Context } from '@nocobase/actions';
import axios from 'axios';

/**
 * 获取当前用户信息
 * @param ctx 必须是middlewares中的ctx
 * @returns
 */
export function getUserInfo(props: { ctx: Context }) {
  const { ctx } = props;
  const { currentUser, currentRole } = ctx.state || {};
  if (isNil(currentUser)) {
    return {};
  }
  const { organizationId, roles } = currentUser || { roles: [], organizationId: null };
  if (isNil(organizationId)) {
    // console.log(`---------[ organizationId is nill ]---------`);
    // console.log(`currentUser:`, currentUser);
  }
  // console.log(`getUserInfo currentUser.organizationId:`, currentUser.organizationId);
  // console.log(`getUserInfo currentUser.name:`, currentUser.name);
  // console.log(`currentUser:`, currentUser);
  // const rolesSet = new Set(roles.map((r) => r.name));
  const isRootOrAdmin = currentRole === 'root' || currentRole === 'admin' || currentRole === 'tkAppRegisterDemoUser';
  const isOrganizationAdminUser = currentRole === 'organizationAdmin';
  const isOrganizationUser = currentRole === 'organizationAdmin';
  const { resourceName, actionName } = ctx.action;
  return {
    userId: currentUser.id,
    organizationId,
    isRootOrAdmin,
    isOrganizationAdminUser,
    isOrganizationUser,
    resourceName,
    actionName,
  };
}

export function serverRequest(props: { url: string; method?: string; ctx?: Context; data?: any; params?: any }) {
  const appPort = process.env['APP_PORT'] ? parseInt(process.env['APP_PORT']) : 13000;
  const serverBaseUrl = `http://127.0.0.1:${appPort}/api`;
  const commonHeader = ['content-type', 'accept', 'authorization', 'x-app', 'x-authenticator', 'x-timezone', 'x-role'];

  const { url, method, data, params, ctx } = props;
  const headers = ctx ? pick(ctx.request.headers, commonHeader) : {};

  return axios.request({
    url: `${serverBaseUrl}/${url}`,
    method: method || 'POST',
    headers,
    params,
    data,
  });
}
