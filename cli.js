#!/usr/bin/env node

let fs = require("fs")
let path = require('path');
const {exec} = require('child_process');

const dirname = path.dirname;

const args = process.argv

const hasDate = args.find(r => r == '--date') || false

const indexFolderOutput = args.findIndex(r => r == '-o')
const output = indexFolderOutput != -1 ? args[indexFolderOutput + 1] : "./src/api-sdk"

const indexPathFile = args.findIndex(r => r == '-i')
const pathFile = indexPathFile != -1 ? args[indexPathFile + 1] : ""

const base = path.dirname(pathFile) + "/"
const name = path.basename(pathFile) || "swagger.yaml"

const indexParts = args.findIndex(r => r == '--parts')
const parts = indexParts != -1 ? args[indexParts + 1] : "parts"

const indexTempFile = args.findIndex(r => r == '--temp')
const tempFile = indexTempFile != -1 ? args[indexTempFile + 1] : "./tempFile.yaml"

String.prototype.replaceAll = function (search, replace) {
    return this.split(search).join(replace);
}

function loadYaml(path) {
    return fs.readFileSync(path, 'utf-8');
}

let allYaml = loadYaml(base + name);
let components = []

fs.readdir(base + parts, function (err, list) {

    console.log(list)

    list
        .forEach(val => components
            .push(loadYaml(base + parts + '/' + val)
            .split('\r\n')
            .map(v => {
                return v.split('\n').map(v => `    ${v}`).join('\n');
            })
            .join('\r\n')
            )
        )

    // Составить итоговый текст yaml
    allYaml += "\r\n\r\ncomponents:\r\n\r\n  schemas:\r\n\r\n"
    allYaml += '\r\n' + components.join('\r\n')

    var listYamls = allYaml.split(/\$ref: '(.*?)'/gm)

    for (let i = 0; i < listYamls.length / 2; i++) {
        if (listYamls[i * 2 + 1])
            listYamls[i * 2 + 1] = "$ref: '#/components/schemas/" + listYamls[i * 2 + 1].split('#/').pop() + "'"
    }

    listYamls = listYamls.join('')
    if (!hasDate) {
        listYamls = listYamls.replaceAll('format: date-time', '').replaceAll('format: date', '')
    }

    listYamls = listYamls.replaceAll('-api-v1-', '-')

    fs.writeFileSync('tempFile.yaml', listYamls)
    fs.writeFileSync(tempFile, listYamls)

    exec(`openapi-generator-cli generate --input-spec ${tempFile} --generator-name typescript-fetch  -t "${process.mainModule.path}/template" --output ${output} --config api.json`, (err, stdout, stderr) => {
        if (err) {
            console.log(err)
        } else {
            fs.unlinkSync(tempFile)
        }
    });


})
