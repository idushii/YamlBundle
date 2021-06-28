FROM node:12
RUN apt-get update && apt-get install -y openjdk-8-jdk
WORKDIR /usr/src/myapp
COPY . /usr/src/myapp
RUN git config --global user.email "server_build@example.com"
RUN git config --global user.name "server build"
RUN mkdir /root/.ssh && chmod 0600 /root/.ssh
RUN ssh-keyscan -t rsa github.com >> /root/.ssh/known_hosts
RUN npm install @openapitools/openapi-generator-cli@2.1.7 -g
RUN npm install
CMD ["node", "cli-prognoz.js"]
