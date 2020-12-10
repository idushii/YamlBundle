const replaceInFiles = require('replace-in-files');
const rimraf = require('rimraf');
const fse = require('fs-extra');
const {exec} = require('child_process');

const options = {
    // See more: https://www.npmjs.com/package/globby
    files: 'temp11/**/*',

    // See more: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace
    from: /package:openapi/g,  // string or regex
    to: 'package:demo_jsonplaceholder/api-sdk', // string or fn  (fn: carrying last argument - path to replaced file)

    saveOldFile: false, // default


    //Character encoding for reading/writing files
    encoding: 'utf8',  // default


    shouldSkipBinaryFiles: true, // default
    onlyFindPathsWithoutReplace: false, // default
    returnPaths: true, // default
    returnCountOfMatchesByPaths: true, // default
}

console.log('after_move')

replaceInFiles(options)
    .then(({ changedFiles, countOfMatchesByPaths }) => {
/*
        console.log('Modified files:', changedFiles);
        console.log('Count of matches by paths:', countOfMatchesByPaths);
        console.log('was called with:', options);
*/

        console.log('move')

        rimraf.sync('C:\\Users\\User\\IdeaProjects\\demo_jsonplaceholder\\lib\\api-sdk');
        fse.moveSync("temp11/lib", 'C:\\Users\\User\\IdeaProjects\\demo_jsonplaceholder\\lib\\api-sdk');

        exec('flutter format C:\\Users\\User\\IdeaProjects\\demo_jsonplaceholder\\lib\\api-sdk', (err, stdout, stderr) => {});



    })
    .catch(error => {
        console.error('Error after occurred:', error);
    });






