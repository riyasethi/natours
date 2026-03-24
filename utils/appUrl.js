const normalizeBaseUrl = (url) => {
    return url.endsWith('/') ? url.slice(0, -1) : url;
};

exports.getAppUrl = (req) => {
    if (process.env.APP_URL) {
        return normalizeBaseUrl(process.env.APP_URL);
    }

    return normalizeBaseUrl(`${req.protocol}://${req.get('host')}`);
};

exports.buildAppUrl = (req, path = '') => {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${exports.getAppUrl(req)}${normalizedPath}`;
};
