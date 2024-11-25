const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logDirectory = path.join(__dirname, '../logs');
if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory, { recursive: true });
}

// Logging functions
function logInfo(message) {
    const formattedMessage = chalk.blue(`[INFO] ${message}`);
    console.log(formattedMessage);
    appendToFile(formattedMessage);
}

function logWarning(message) {
    const formattedMessage = chalk.yellow(`[WARNING] ${message}`);
    console.warn(formattedMessage);
    appendToFile(formattedMessage);
}

function logError(message) {
    const formattedMessage = chalk.red(`[ERROR] ${message}`);
    console.error(formattedMessage);
    appendToFile(formattedMessage);
}

function logSuccess(message) {
    const formattedMessage = chalk.green(`[SUCCESS] ${message}`);
    console.log(formattedMessage);
    appendToFile(formattedMessage);
}

function appendToFile(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} - ${message}\n`;
    const logFilePath = path.join(logDirectory, 'server.log');

    // Asynchronously write to the log file
    fs.appendFile(logFilePath, logMessage, (err) => {
        if (err) {
            console.error(chalk.red(`[ERROR] Failed to write to log file: ${err.message}`));
        }
    });
}

module.exports = { logInfo, logWarning, logError, logSuccess };
