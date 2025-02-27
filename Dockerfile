FROM node:20-bookworm as builder
ARG VERDACCIO_URL=http://106.55.173.188:10104
# ARG COMMIT_HASH
ARG APPEND_PRESET_LOCAL_PLUGINS
ARG BEFORE_PACK_NOCOBASE="ls -l"
ARG PLUGINS_DIRS

ENV PLUGINS_DIRS=${PLUGINS_DIRS}

# RUN apt-get update && apt-get install -y jq expect

#RUN expect <<EOD
#spawn npm adduser --registry $VERDACCIO_URL
#expect {
#  "Username:" {send "test\r"; exp_continue}
#  "Password:" {send "test\r"; exp_continue}
#  "Email: (this IS public)" {send "test@nocobase.com\r"; exp_continue}
#}
#EOD

WORKDIR /tmp
COPY . /tmp

# RUN yarn config set registry https://registry.npmmirror.com/
# 自定义开发插件不参与编译,因为他们是通过插件上传来维护的
RUN rm -f .yarnrc
RUN rm -fR /tmp/packages/plugins/@tx
RUN ls -al /tmp/packages/plugins/

# RUN npx npm-cli-login -u test -p test -e test@nocobase.com -r $VERDACCIO_URL
RUN yarn config list
RUN yarn install 
RUN yarn build

CMD ["/app/docker-entrypoint.sh"]
