module.exports.formatJobs = (jobs) => {
    return {
            "data": {
                "jobs": jobs
            }
        }
}

module.exports.formatError = (code) => {
    return {
        "error": {
            "code": code,
            "message": "Internal server error (not your fault)"
        }
    }
}