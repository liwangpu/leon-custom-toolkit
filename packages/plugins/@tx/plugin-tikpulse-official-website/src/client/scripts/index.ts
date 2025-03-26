import { Plugin } from '@nocobase/client';

export const registerScripts = (props: { plugin: Plugin }) => {
  //
  loadUamaiScript();
};

const loadUamaiScript = () => {
  const script = document.createElement('script');
  script.defer = true;
  script.src = `https://analysis.taixiang-tech.com/script.js`;
  script.setAttribute('data-website-id', 'dba9afd1-943c-4251-9e84-c209b4ae2fa3');
  document.head.appendChild(script);
};
