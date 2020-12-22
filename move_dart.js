const replaceInFiles = require('replace-in-files');
const rimraf = require('rimraf');
const fse = require('fs-extra');
const {exec} = require('child_process');

var folder = 'C:\\Users\\User\\Documents\\checksy_mobile_api'
var folderSrc = 'C:\\Users\\User\\Documents\\checksy_mobile_api\\src'

rimraf.sync(folderSrc);
fse.moveSync("temp11", folderSrc);

fse.copySync("after_update_api_sdk_dart.bat", `${folderSrc}\\after_update_api_sdk_dart.bat`);
fse.copySync("models.dart", `${folderSrc}\\models.dart`);

exec(`flutter format ${folderSrc}`, (err, stdout, stderr) => {});
exec(`${folder}\\after_update_api_sdk_dart.bat`, (err, stdout, stderr) => {});

return;

const options = {
    // See more: https://www.npmjs.com/package/globby
    files: 'temp11/**/*',

    // See more: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace
    from: /package:openapi/g,  // string or regex
    to: 'package:checksy_mobile/api-sdk', // string or fn  (fn: carrying last argument - path to replaced file)

    saveOldFile: false, // default


    //Character encoding for reading/writing files
    encoding: 'utf8',  // default


    shouldSkipBinaryFiles: true, // default
    onlyFindPathsWithoutReplace: false, // default
    returnPaths: true, // default
    returnCountOfMatchesByPaths: true, // default
}

console.log('before_move')

replaceInFiles(options)
    .then(({ changedFiles, countOfMatchesByPaths }) => {
        /*
                console.log('Modified files:', changedFiles);
                console.log('Count of matches by paths:', countOfMatchesByPaths);
                console.log('was called with:', options);
        */

        console.log('move')

        rimraf.sync('C:\\Users\\User\\Documents\\checksy_mobile\\lib\\api-sdk');
        fse.moveSync("temp11/lib", 'C:\\Users\\User\\Documents\\checksy_mobile\\lib\\api-sdk');

        exec('flutter format C:\\Users\\User\\Documents\\checksy_mobile\\lib\\api-sdk', (err, stdout, stderr) => {});

    })
    .catch(error => {
        console.error('Error after occurred:', error);
    });






