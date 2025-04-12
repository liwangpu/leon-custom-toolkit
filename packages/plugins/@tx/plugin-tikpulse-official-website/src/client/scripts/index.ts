import { Plugin } from '@nocobase/client';

export const registerScripts = (props: { plugin: Plugin }) => {
  //
  loadUamaiScript();
};

const loadUamaiScript = () => {
  const script = document.createElement('script');
  script.defer = true;
  script.src = `https://analysis.tikpulse.net/script.js`;
  script.setAttribute('data-website-id', 'b364836f-7339-4e76-97c5-aedd91be8e0d');
  document.head.appendChild(script);
};
