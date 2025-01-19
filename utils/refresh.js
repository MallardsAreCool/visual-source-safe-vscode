const { getRefreshRate } = require('./config');
const { refreshCurrentlyCheckedout } = require('../visual_source_safe/sourcesafe');
const { debounce } = require('./debounce');

var intervalID;

function startRefresh() {
    intervalID = setInterval(function pollRefresh() {
        refreshCurrentlyCheckedout();
    }, getRefreshRate());
}

function restartRefresh() {
    if (!!intervalID) {
        clearInterval(intervalID);
    }

    startRefresh();
}

const debouncedRestartRefresh = debounce(() => {
    restartRefresh();
}, 500);

module.exports = {
    restartRefresh
    , debouncedRestartRefresh
};