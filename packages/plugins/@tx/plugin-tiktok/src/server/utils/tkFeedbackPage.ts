export const TK_FEEDBACK_PAGE = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Astrolabe</title>
    <style>
      html,
      body {
        width: 100%;
        height: 100%;
        font-family: Roboto, "Helvetica Neue", sans-serif;
      }

      *,
      *::before,
      *::after {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      .page {
        display: flex;
        flex-flow: column;
        width: 100%;
        height: 100%;
      }

      .page-header {
      }
      .page-content {
        display: flex;
        flex-flow: column;
        flex: 1;
        background-color: #f5f5f5;
      }
      .message-box {
        display: flex;
        flex-flow: column;
        align-items: center;
        width: 100%;
        flex: 1;
      }
      .message-info {
        margin-top: 180px;
        font-size: 22px;
        color: #0078e7;
      }
      #btn-close {
        margin-top: 10px;
        background-color: #0078e7;
        color: #fff;
        border: #0000;
        border-radius: 4px;
        font-size: 100%;
        padding: 6px 12px;
        cursor: pointer;
      }
    </style>
    <script>
      window.onload = function () {
        // var btnCloseDom = document.getElementById("btn-close");
        // let countdown = 5;
        // var closeFn = () => {
        //   // window.close();
        //   window.open(location.href, "_self", "");
        //   window.close();
        // };
        // var it = setInterval(() => {
        //   countdown--;
        //   if (countdown === 0) {
        //     closeFn();
        //     return clearInterval(it);
        //   }
        //   btnCloseDom.innerHTML = '秒后自动关闭窗口，或点击立即关闭‘;
        // }, 1000);

        // btnCloseDom.addEventListener("click", closeFn);
      };
    </script>
  </head>
  <body>
    <div class="page">
      <div class="page-header"></div>
      <div class="page-content">
        <div class="message-box">
          <p class="message-info">授权成功，您可以立即关闭窗口继续执行其他操作！</p>
        </div>
      </div>
    </div>
  </body>
</html>
`;

const TK_REGISTER_AUTHORIZE_PAGE = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Astrolabe</title>
    <style>
      html,
      body {
        width: 100%;
        height: 100%;
        font-family: Roboto, "Helvetica Neue", sans-serif;
      }

      *,
      *::before,
      *::after {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      .page {
        display: flex;
        flex-flow: column;
        width: 100%;
        height: 100%;
      }

      .page-header {
      }
      .page-content {
        display: flex;
        flex-flow: column;
        flex: 1;
        background-color: #f5f5f5;
      }
      .message-box {
        display: flex;
        flex-flow: column;
        align-items: center;
        width: 100%;
        flex: 1;
      }
      .message-info {
        margin-top: 180px;
        font-size: 22px;
        color: #0078e7;
      }
      #btn-close {
        margin-top: 10px;
        background-color: #0078e7;
        color: #fff;
        border: #0000;
        border-radius: 4px;
        font-size: 100%;
        padding: 6px 12px;
        cursor: pointer;
      }
    </style>
    <script>
      window.onload = function () {
        var token = "__token__";
        if (token) {
          localStorage.setItem("NOCOBASE_TOKEN", token);
        }

        var btnCloseDom = document.getElementById("btn-close");
        var countdown = 5;
        var backToHomeFn = () => {
          window.location.href = "/";
        };

        var setButtonCountDownTitle = (time) => {
          btnCloseDom.innerHTML =
            "Redirect to home page or automatically redirect after " +
            time +
            " seconds";
        };
        setButtonCountDownTitle(countdown);
        var it = setInterval(() => {
          countdown--;
          if (countdown === 0) {
            backToHomeFn();
            return clearInterval(it);
          }
          setButtonCountDownTitle(countdown);
        }, 1000);

        btnCloseDom.addEventListener("click", backToHomeFn);
      };
    </script>
  </head>
  <body>
    <div class="page">
      <div class="page-header"></div>
      <div class="page-content">
        <div class="message-box">
          <p class="message-info">Tiktok Authorize Success!</p>
          <button id="btn-close"></button>
        </div>
      </div>
    </div>
  </body>
</html>

`;

export const generateRegisterAuthorizePage = (token: string) => {
  const page = TK_REGISTER_AUTHORIZE_PAGE;
  return page.replace('__token__', token);
};
