module.exports.formatJobs = (jobs) => {
    return {
            "data": {
                "jobs": jobs
            }
        }
}

module.exports.error = (code) => {
    return {
        "error": {
            "code": code,
            "message": "Internal server error (not your fault)"
        }
    }
}