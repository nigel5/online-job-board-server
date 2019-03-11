module.exports.formatJobs = (jobs) => {
    return {
            "data": {
                "jobs": jobs
            }
        }
}

module.exports.formatError = (code, message) => {
    return {
        "error": {
            "code": code,
            "message": message
        }
    }
}