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


module.exports = addDBOPostfix;
