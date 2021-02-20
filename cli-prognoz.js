#!/usr/bin/env node

const fetch = require('node-fetch');

let fs = require("fs")
let path = require('path');
// const doMove  = require('./move_dart2');
const addDBOPostfix  = require('./prefics');
const {exec, execSync} = require('child_process');


const remoteFileUrl = 'https://swagger.prognoz.me/swagger-client.yml';
const tempFile = '_prognoz.json';
const projectFolder = 'prognoz_api_sdk';

async function downloadFile() {
    const res = await fetch(remoteFileUrl);
    const json = await res.text();
    fs.writeFileSync(tempFile, json);
    return json;
}

String.prototype.replaceAll = function (search, replace) {
    return this.split(search).join(replace);
}

async function main() {

    let listYamls = await downloadFile();

    listYamls = listYamls.replaceAll('-api-v1-', '-')
    listYamls = listYamls.replaceAll('/api/v1/', '/')


    // listYamls = addDBOPostfix(listYamls);

    listYamls = listYamls.replaceAll('notification', 'notificationDBO');

    fs.writeFileSync(tempFile, listYamls)

    const cmd = `openapi-generator-cli generate --input-spec ${tempFile} --generator-name dart --output ../${projectFolder} -t "./all-templates/dart2" --config open-generator-config-prognoz.yaml`
    const cmdSendRepo = `cd ../${projectFolder} && git add * && git commit -m "update ${new Date().toISOString()}" && git push`

    console.log(`run '${cmd}'`)

    try {
        const res = await execSync(cmd);
        console.log(String.fromCharCode.apply(null, res));
    } catch (e) {
        console.log(String.fromCharCode.apply(null, e.output[1]));
    }

    fs.writeFileSync(`../${projectFolder}/openapi.yaml`, listYamls, {encoding: 'utf-8'});

    try {
        const res2 = (await (execSync(cmdSendRepo)));
        console.log(String.fromCharCode.apply(null, res2));
    } catch (e) {
        console.log(String.fromCharCode.apply(null, e.output[1]));
    }

}

main();
