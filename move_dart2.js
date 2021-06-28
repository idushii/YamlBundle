const rimraf = require('rimraf');
const fse = require('fs-extra');
const {exec, execSync} = require('child_process');

function doMove() {

    const folder = 'C:\\Users\\User\\Documents\\checksy_mobile_api'
    const folderSrc = 'C:\\Users\\User\\Documents\\checksy_mobile_api\\src'
    const tempFolder = './temp11';
    const tempFolderLib = './temp11\\lib';

    rimraf.sync(folderSrc);

    // fse.copySync("models.dart", `${tempFolderLib}\\models.dart`);
    fse.copySync(tempFolder, folderSrc);

    // fse.copySync("after_update_api_sdk_dart.bat", `${folderSrc}\\after_update_api_sdk_dart.bat`);

    try {
        try {
            execSync(`cd ${folderSrc} && pub get`);
            // execSync(`cd ${folderSrc} && flutter clean`);
            // execSync(`cd ${folderSrc} && flutter pub run build_runner clean`);
        } catch (e) {
            console.error(e)
        }
        // console.log(execSync(`cd ${folderSrc} && flutter pub get`));
        // console.log(execSync(`cd ${folderSrc} && flutter pub run build_runner build`));
        console.log(execSync(`flutter format ${folderSrc}`));
    } catch (e) {
        console.error(e)
    }
}

// doMove();

module.exports = doMove;