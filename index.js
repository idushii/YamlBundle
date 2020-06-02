let fs = require("fs")

const base = "./swagger/"
const name = "frontend.yaml"


String.prototype.replaceAll = function (search, replace) {
    return this.split(search).join(replace);
}


let allYaml = fs.readFileSync(base + name, 'utf-8');

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
    let newName = path.split(/[(\.\/)(\#\/)]/).filter(v => v && v != 'yaml').join('__')
    let filePath = path.replace('./', '').replace(/(\#\/\S*)/, '')
    let fileFolder = require('path').dirname(filePath)
    let fileName = fileFolder.split('/').pop();
    let allRefText = fs.readFileSync(base + folder + '/' + filePath, 'utf-8')

    let value = allRefText.split(new RegExp("\n" + oldName + ":"))[0].split(/\n\S*\:/)[0].split('\r\n')
    value[0] = newName + ':';
    value = '    ' + value.filter(v => v).join('\r\n    ') + '\r\n'
    links.set(path, newName)
    return {newName, filePath, oldName, value, fileFolder, fileName}
}


// Получение массива внешних объектов
function getRefsObjects(RefsNamesUnic) {
    let Refs = new Map()
    RefsNamesUnic.forEach(path => {

        let {value, newName, filePath, oldName, fileFolder, fileName} = extructRefByName(path)

        //Рекурсивное выделение ссылок
        const LocalRefs = getRefsLinks(value);

        LocalRefs.forEach(value => {
            let _filePath = path.replace('./', '').replace(/(\#\/\S*)/, '')
            let [_fileName, _refName] = value.split('#/').filter(v => v)
            let _path = '';
            if (_refName) {
                let _folder = require('path').dirname(_filePath)
                _path = _folder + '/' + value;
            } else {
                _path = filePath + value;
            }

            let ref = extructRefByName(path)
            Refs.set(ref.newName, ref)
            links.set((_fileName ?? fileName) + ref.newName, ref.newName)
            links.set(value, ref.newName)
        })

        let _path = path.split('./').join('')

        Refs.set(newName, {
            oldName,
            filePath,
            newName,
            value
        })

    })
    return Refs;
}

RefsObjets = getRefsObjects(RefsNamesUnic);

// Обновить ссылки
RefsObjets.forEach(ref => {
    allYaml = allYaml.replaceAll(ref.oldPath, '#/components/schemas/' + ref.newName)
})

// Составить итоговый текст yaml
if (allYaml.indexOf('components:') === -1)
    allYaml += "\r\n\r\ncomponents:\r\n\r\n  schemas:\r\n\r\n"
allYaml += '\r\n' + [...RefsObjets.values()].map(v => v.value).join('')

// Обновить ссылки
RefsObjets.forEach(ref => {
    allYaml = allYaml.replaceAll(ref.oldPath, '#/components/schemas/' + ref.newName)
})

links.forEach((name, path) => {
    allYaml = allYaml.replaceAll(path, '#/components/schemas/' + name)
})

fs.writeFileSync('res.yaml', allYaml)


