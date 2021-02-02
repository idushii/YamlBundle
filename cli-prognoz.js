#!/usr/bin/env node

const fetch = require('node-fetch');

let fs = require("fs")
let path = require('path');
// const doMove  = require('./move_dart2');
const {exec, execSync} = require('child_process');


const remoteFileUrl = 'https://swagger.prognoz.me/swagger-client.json';
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

function addDBOPostfix(yaml) {
    const postFix = "DBO";

    let lines = yaml.split('\n')

    const startIndexLine = lines.findIndex((line) => line.includes('components:'));
    const endIndexLine = lines.findIndex((line) => line.includes('securitySchemes:'));

    for (let i = startIndexLine; i < endIndexLine; i++) {
        let line = lines[i];

        const res = /^    (\w){1,100}/gm.exec(line);
        if (res) {
            lines[i] = res[0] + postFix + ":\r\n"

            const oldName = res[0].trim();
            const oldPathComponent = `$ref: '#/components/schemas/${oldName}'`

            const newName = res[0].trim();
            const newPathComponent = `$ref: '#/components/schemas/${newName}${postFix}'`

            for (let j = 0; j < lines.length; j++) {
                lines[j] = lines[j].replace(oldPathComponent, newPathComponent)
            }
        }
    }

    return lines.join('\n');
}

async function main() {

    let listYamls = await downloadFile();

    listYamls = listYamls.replaceAll('-api-v1-', '-')
    listYamls = listYamls.replaceAll('/api/v1/', '/')


    // listYamls = addDBOPostfix(listYamls);

    fs.writeFileSync(tempFile, listYamls)

    const cmd = `openapi-generator-cli generate --input-spec ${tempFile} --generator-name dart --output ../${projectFolder} -t "./all-templates/dart2" --config open-generator-config-prognoz.yaml`
    const cmdSendRepo = `cd ../${projectFolder} && git add * && git commit "update ${new Date().toISOString()}" && git push`

    console.log(`run '${cmd}'`)

    const res = await execSync(cmd);
    console.log(String.fromCharCode.apply(null, res));

    const res2 = await execSync(cmdSendRepo);
    console.log(String.fromCharCode.apply(null, res2));

}

main();
