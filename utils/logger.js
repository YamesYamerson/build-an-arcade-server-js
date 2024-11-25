const chalk = require('chalk');
const fs = require('fs');

function logInfo(message) {
    const formattedMessage = chalk.blue(`[INFO] ${message}`);
    console.log(formattedMessage);
    appendToFile(formattedMessage);
}

function logError(message) {
    const formattedMessage = chalk.red(`[ERROR] ${message}`);
    console.error(formattedMessage);
    appendToFile(formattedMessage);
}

function appendToFile(message) {
    const logMessage = `${new Date().toISOString()} - ${message}\n`;
    fs.appendFileSync('./logs/server.log', logMessage);
}

module.exports = { logInfo, logError };
