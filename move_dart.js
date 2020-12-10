console.log('move')

const rimraf = require('rimraf');
const fse = require('fs-extra');

rimraf.sync('C:\\Users\\User\\Documents\\checksy_mobile\\lib\\api-sdk');
fse.moveSync("temp11/lib", 'C:\\Users\\User\\Documents\\checksy_mobile\\lib\\api-sdk');