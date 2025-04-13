import React, { useState } from 'react';
import { createStyles, useCurrentUserContext } from '@nocobase/client';
import { observer } from 'mobx-react-lite';
import { Button, Dropdown, MenuProps } from 'antd';
import { useEvent } from '../hooks';
import { isFunction, isNil } from 'lodash';
import { AppStore } from './store';
import { LogoutOutlined } from '@ant-design/icons';
import Avatar from '../assets/images/user.png';
import { useFreeTrialForm } from './forms/FreeTrialForm';
import { useSignInForm } from './forms/SignInForm';

const useStyles = createStyles(({ css, responsive }) => {
  return {
    operators: css`
      height: 100%;
      display: flex;
      flex-flow: row;
      align-items: center;
      & > *:not(:last-of-type) {
        margin-right: 20px;
      }
    `,
    freeTrialBtn: css`
      background-color: rgb(4, 4, 4);
      padding: 8px 14px;
      color: #fff;
      font-size: 16px;
      font-weight: 700;
      min-width: 96px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      ${responsive.sm} {
        font-size: 13px;
        padding: 4px 7px;
      }
      &:hover {
        background-color: #273333;
      }
    `,
    requestDemoBtn: css`
      padding: 8px 14px;
      color: rgb(4, 4, 4);
      font-size: 16px;
      font-weight: 700;
      border: 2px solid rgb(4, 4, 4);
      border-radius: 6px;
      background-color: transparent;
      cursor: pointer;
      ${responsive.sm} {
        font-size: 13px;
        padding: 4px 7px;
      }
      &:hover {
        color: #273333;
      }
    `,
    loginBtn: css`
      background: rgba(1, 77, 255, 0.1);
      color: #014dff;
    `,
    operatorContainer: css`
      display: flex;
      flex-flow: column;
      /* justify-content: center; */
      align-items: flex-start;
      width: 100%;
      padding: 0 0 34px 68px;
      gap: 6px 0;
    `,
    submitBtn: css`
      /* max-width: 420px; */
    `,
    fullWidth: css`
      width: 100%;
    `,
    customModal: css`
      & .ant-modal-content {
        padding: 0 !important;
        border-radius: 8px !important;
      }
    `,
    userInfo: css`
      display: flex;
      align-items: center;
      font-size: 16px;
      font-weight: 700;
      margin-left: 20px;
      gap: 0 8px;
      cursor: pointer;
    `,
    userAvatar: css`
      width: 38px;
      height: 38px;
    `,
  };
});

export interface IHeaderOperatorProps {
  store: AppStore;
}

const HeaderOperator: React.FC<IHeaderOperatorProps> = observer((props) => {
  const { store } = props;
  const { styles } = useStyles();
  const currentUserContext = useCurrentUserContext();
  const currentUser = currentUserContext?.data?.data;
  const notLogin = isNil(currentUser) || isNil(currentUser.id);

  const { contextHolder: freeTrialFormContextHolder, toggleModa: toggleFreeTrialFormModa } = useFreeTrialForm({
    onNavigateLogin: () => {
      toggleFreeTrialFormModa(false);
      toggleSignInFormModa(true);
    },
  });

  const { contextHolder: signInFormContextHolder, toggleModa: toggleSignInFormModa } = useSignInForm({
    onNavigateSignIn() {
      toggleSignInFormModa(false);
      toggleFreeTrialFormModa(true);
    },
  });

  const handleFreeTrial = useEvent(() => {
    toggleSignInFormModa(true);
  });

  const handleLogout = useEvent(() => {
    localStorage.removeItem('NOCOBASE_TOKEN');
    window.location.reload();
  });

  const handleRequestDemo = useEvent(() => {
    store.requestDemoHandler();
  });

  const renderUserInfo = () => {
    if (notLogin) return;
    const items: MenuProps['items'] = [
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: <div>退出登录</div>,
        onClick: handleLogout,
      },
    ];
    return (
      <Dropdown menu={{ items }}>
        <div className={styles.userInfo}>
          <img className={styles.userAvatar} src={Avatar} />
          <div>{currentUser.nickname}</div>
        </div>
      </Dropdown>
    );
  };

  return (
    <div className={styles.operators}>
      {freeTrialFormContextHolder()}
      {signInFormContextHolder()}

      <button className={styles.requestDemoBtn} onClick={handleRequestDemo}>
        预约演示
      </button>

      {notLogin && (
        <button className={styles.freeTrialBtn} onClick={handleFreeTrial}>
          登录
        </button>
      )}

      {renderUserInfo()}
    </div>
  );
});

HeaderOperator.displayName = 'HeaderOperator';

export default HeaderOperator;

// export function useCompanySKUUniqueCheckRule(id: string) {
//   const check = useEvent(async (val: string) => {
//     // 如果以-结尾,说明正在编排sku,不必查询
//     const { data } = await axios.request({
//       url: '/api/production/query',
//       method: 'POST',
//       data: {
//         select: ['companySKU'],
//         filter: {
//           companySKU: val.trim(),
//         },
//       },
//     }) as IRequestResult;
//     const { count, content } = data;
//     if (id && count > 0 && content.some(c => c.id === id)) {
//       return false;
//     }
//     return count > 0;
//   });

//   return useUniqueCheckRule({ message: 'SKU已经存在!', check });
// }
