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
    let RefsNames = []
    const regex = /\$ref: '(.*?)'/gm;
    while ((m = regex.exec(allYaml)) !== null) {
        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }

        RefsNames.push(m[1])
    }

// Выделяю уникальные ссылки
    RefsNamesUnic = new Set();
    RefsNames.forEach(value => {
        RefsNamesUnic.add(value)
    })
    return RefsNamesUnic;
}

RefsNamesUnic = getRefsLinks(allYaml);

// Получение массива внешних объектов
function getRefsObjects(RefsNamesUnic) {
    let Refs = []
    RefsNamesUnic.forEach(name => {
        let oldName = (/#\/(.*)/gm).exec(name)[1]
        let newName = name.split(/[(\.\/)(\#\/)]/).filter(v => v && v != 'yaml').join('__')

        let path = name.replace('./', '').replace(/(\#\/\S*)/, '')
        let allRefText = fs.readFileSync(base + path, 'utf-8')

        let curRef = allRefText.split(new RegExp("\n" + oldName + ":"))[0].split(/\n\S*\:/)[0].split('\r\n')
        curRef[0] = newName + ':';
        curRef = '    ' + curRef.filter(v => v).join('\r\n    ') + '\r\n'

        Refs.push({
            oldName,
            oldPath: name,
            path,
            name: newName,
            value: curRef
        })
    })
    return Refs;
}

RefsObjets = getRefsObjects(RefsNamesUnic);

// Обновить ссылки
RefsObjets.forEach(ref => allYaml = allYaml.replaceAll(ref.oldPath, '#/components/schemas/' + ref.name))

// Составить итоговый текст yaml
if (allYaml.indexOf('components:') === -1)
    allYaml += "\r\n\r\ncomponents:\r\n\r\n  schemas:\r\n\r\n"
allYaml += '\r\n' + RefsObjets.map(v => v.value).join('')

fs.writeFileSync('res.yaml', allYaml)


