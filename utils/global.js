function tidyFilePath(filePath) {
    return filePath.replaceAll('\\', '/').replace(/\/$/, '').toLowerCase();
}


module.exports = { tidyFilePath };