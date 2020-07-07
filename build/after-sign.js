require('dotenv').config();
const { notarize } = require('electron-notarize');

exports.default = run;

async function run(context) {
    const appleId = process.env.APPLEID;
    const appName = context.packager.appInfo.productFilename;
    const appPath = `${context.appOutDir}/${appName}.app`;
    const macBuild = context.electronPlatformName === 'darwin';

    if (!macBuild) {
        return;
    }

    console.log('  • notarizing ' + appPath);
    return await notarize({
        appBundleId: 'co.schof.things-stats',
        appPath: appPath,
        appleId: appleId,
        appleIdPassword: process.env.APPLEIDPASS,
    });
}
