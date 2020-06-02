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


/*
// Составляю список ссылок
function getRefsLinks(yaml) {
    var m;
    let _refsNames = []
    const regex = /\$ref: '(.*?)'/gm;
    while ((m = regex.exec(yaml)) !== null) {
        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }

        _refsNames.push(m[1])
    }

// Выделяю уникальные ссылки
    const _refsNamesUnic = new Set();
    _refsNames.forEach(value => {
        _refsNamesUnic.add(value)
    })
    return _refsNamesUnic;
}

RefsNamesUnic = getRefsLinks(allYaml, folder = '');
links = new Map();

function extructRefByName(path, folder = '') {
    let oldName = (/#\/(.*)/gm).exec(path)[1]
    //let newName = [folder, ...path.split(/[(\.\/)(\#\/)]/).filter(v => v && v != 'yaml')].join('__')
    let newName = path.split(/[(\.\/)(\#\/)]/).filter(v => v && v != 'yaml').pop()
    let filePath = path.replace('./', '').replace(/(\#\/\S*)/, '')
    let fileFolder = (dirname(folder + '/' + filePath))
    let fileName = filePath.split('/').pop();
    let allRefText = fs.readFileSync(base + folder + '/' + filePath, 'utf-8')

    let value = allRefText.split(new RegExp("\n" + oldName + ":"))[0].split(/\n\S*\:/)[0].split('\r\n')
    value[0] = newName + ':';
    value = '    ' + value.filter(v => v).join('\r\n    ') + '\r\n'
    links.set(path, {name: newName, path})
    return {newName, filePath, oldName, value, fileFolder, fileName}
}


// Получение массива внешних объектов
function getRefsObjects(RefsNamesUnic, folder = '') {
    let Refs = new Map()
    RefsNamesUnic.forEach(path => {

        let {value, newName, filePath, oldName, fileFolder, fileName} = extructRefByName(path, folder)

        //Рекурсивное выделение ссылок
        const LocalRefs = getRefsLinks(value);

        LocalRefs.forEach(value => {
            let _filePath = (folder + '/' + path).replace('./', '').replace(/(\#\/\S*)/, '').replace('//', '/')
            let [_fileName, _refName] = value.split('#/').filter(v => v)
            let _path = '';
            if (_refName) {
                let _folder = require('path').dirname(_filePath)
                _path = _folder + '/' + value;
            } else {
                _path = filePath + value;
            }

            let ref = extructRefByName(path, folder)
            Refs.set(ref.newName, ref)
            links.set((_fileName ?? fileName) + ref.newName, {
                name: ref.newName,
                path: (_fileName ?? fileName) + ref.newName
            })
            links.set(value, {name: ref.newName, path: value})
        })

        let _path = path.split('./').join('')

        Refs.set(newName, {
            oldName,
            filePath,
            newName,
            value,
            oldPath: path,
        })

    })
    return Refs;
}

RefsObjets = getRefsObjects(RefsNamesUnic);

// Обновить ссылки
function updatedRefs(allYaml = '', refs, namePath, nameNameUpdate) {
    let items = [...refs.values()]
    items.forEach(ref => {
        allYaml = allYaml.replaceAll("'" + ref[namePath] + "'", "'#/components/schemas/" + ref[nameNameUpdate] + "'")
    })
    return allYaml;
}

[...RefsObjets.values()].forEach(ref => {
    let remoteRefs = getRefsLinks(ref.value)
    var __ref = ref;
    var folder = dirname(ref.filePath)

    remoteRefs.forEach(_ref => {
        console.log(_ref)
        if (_ref.substr(0, 2) == './') {
            // внешняя ссылка, надо загрузить код
            let yaml = loadYaml( base +  dirname(folder + _ref).replaceAll('./', '/').replaceAll('#', ''))
            let _RefsObjets = getRefsObjects([_ref], folder);
            _RefsObjets.forEach((val, key) => RefsObjets.set(key, val))
        }
    })
})

allYaml = updatedRefs(allYaml, RefsObjets, 'oldPath', 'newName');

// Составить итоговый текст yaml
if (allYaml.indexOf('components:') === -1)
    allYaml += "\r\n\r\ncomponents:\r\n\r\n  schemas:\r\n\r\n"
allYaml += '\r\n' + [...RefsObjets.values()].map(v => v.value).join('')

allYaml = updatedRefs(allYaml, RefsObjets, 'oldPath', 'newName');
allYaml = updatedRefs(allYaml, links, 'path', 'name');

allYaml.replaceAll('-api-v1-', '-')

fs.writeFileSync('res.yaml', allYaml)


//*/