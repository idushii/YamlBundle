#!/usr/bin/env node

let fs = require("fs")
let path = require('path');
const doMove  = require('./move_dart2');
const {exec} = require('child_process');

const args = process.argv

const indexPathFile = args.findIndex(r => r == '-i')
const pathFile = indexPathFile != -1 ? args[indexPathFile + 1] : ""

const base = path.dirname(pathFile) + "/"
const name = path.basename(pathFile) || "swagger.yaml"

const indexTempFile = args.findIndex(r => r == '--temp')
const tempFile = indexTempFile != -1 ? args[indexTempFile + 1] : "./tempFile.yaml"

String.prototype.replaceAll = function (search, replace) {
    return this.split(search).join(replace);
}

function loadYaml(path) {
    return fs.readFileSync(path, 'utf-8');
}

let listYamls = loadYaml(base + name);


listYamls = listYamls.replaceAll('-api-v1-', '-')
listYamls = listYamls.replaceAll('/api/v1/', '/')

function addDBOPostfix(yaml) {
    const postFix = "DBO";

    let lines = yaml.split('\n')

    const startIndexLine = lines.findIndex((line) => line.includes('components:'));
    const endIndexLine = lines.findIndex((line) => line.includes('securitySchemes:'));

    for(let i=startIndexLine; i< endIndexLine; i++) {
        let line = lines[i];

        const res = /^    (\w){1,100}/gm.exec(line);
        if (res) {
            lines[i] = res[0] + postFix + ":\r\n"

            const oldName = res[0].trim();
            const oldPathComponent = `$ref: '#/components/schemas/${oldName}'`

            const newName = res[0].trim();
            const newPathComponent = `$ref: '#/components/schemas/${newName}${postFix}'`

            for(let j=0; j<lines.length; j++) {
                lines[j] = lines[j].replace(oldPathComponent, newPathComponent)
            }
        }
    }

    return lines.join('\n');
}

listYamls = addDBOPostfix(listYamls);

fs.writeFileSync(tempFile, listYamls)

const cmd = `openapi-generator-cli generate --input-spec ${tempFile} --generator-name dart --output ./temp11 -t "./all-templates/dart2" --config open-generator-config.yaml`

console.log(`run '${cmd}'`)

exec(cmd, (err, stdout, stderr) => {
    console.log(stdout)
    if (err) {
        console.log(err)
    } else {

        doMove();

        //fs.unlinkSync(tempFile)

        /*await rimraf.sync("/target");

        fse.moveSync("temp", output);*/

    }
});

