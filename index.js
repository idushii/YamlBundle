let fs = require("fs")
let path = require('path');

const dirname = path.dirname;

const base = "./swagger/"
const name = "frontend.yaml"
const parts = "parts"


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

    list.forEach(val => components.push(loadYaml(base + parts + '/' + val).split('\r\n').map(v => `    ${v}`).join('\r\n')))

    // Составить итоговый текст yaml
    allYaml += "\r\n\r\ncomponents:\r\n\r\n  schemas:\r\n\r\n"
    allYaml += '\r\n' + components.join('\r\n')

    var listYamls = allYaml.split(/\$ref: '(.*?)'/gm)

    for (let i = 0; i < listYamls.length / 2; i++) {
        if (listYamls[i * 2 + 1])
            listYamls[i * 2 + 1] = "$ref: '#/components/schemas/" + listYamls[i * 2 + 1].split('#/').pop() +  "'"
    }

    fs.writeFileSync('res.yaml', listYamls.join('').split('-api-v1-').join('-'))
})
