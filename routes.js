const router = require('express').Router()
const ns = require('./nospoof')
const rb = require('./util/response-builder')

router.get('/', (req, res) => {
    return res.send('There is nothing here :(')
})

router.get('/api/v1/jobs/:truckId', (req, res) => {
    // Send response with list of jobs, if the truck is availble
    ns.isOnRoute(req.params.truckId, (onRoute, err) => {
        if (err) res.status(500).send('Internal server error:', err)
        else if (onRoute) {
            return res.status(200).send({
                "error": {
                    "code": 200,
                    "message": "The truck is already delivering a load"
                }
            })
        }
        else {
            ns.getJobs(req.body.truckId, (jobs, err) => {
                if (err) res.status(500).send(rb.formatError(500))
                return res.status(200).send(rb.formatJobs(jobs))
            })
        }
    })
})

router.get('/api/v1/profile/:truckId', (req, res) => {
    // Send response with list of jobs, if the truck is availble
    ns.getTruck(req.params.truckId, (truck, err) => {
        if (err) res.status(500).send(rb.formatError(500))
        return res.status(200).send({ "data": { "truck": truck }})
    })
})

router.get('/api/v1/job/:jobId', (req, res) => {
    // Sends the requested job information
    ns.getJob(req.params.jobId, (job, err) => {
        if (err) return res.status(500).send(rb.formatError(500, "Internal server error (not your fault)"))
        if (job === null && err === null) {
            return res.status(200).send(rb.formatError(200, "Invalid job id"))
        }
        else {
            return res.status(200).send({ "data": { "job": job }})
        }
    })
})

router.post('/api/v1/select-job/:jobId', (req, res) => {
    // Only be able to select the job if the are avaiable
    ns.isOnRoute(req.body.truckId, (onRoute, err) => {
        if (err) { return res.status(500).send(rb.formatError(500, "Internal server error (not your fault)")) }
        if (onRoute === null && err === null) {
            return res.status(200).send(rb.formatError(200, "Invalid job id"))
        }
        else if (onRoute) {
            return res.status(200).send(rb.formatError(200, "Truck is already on a job"))
        }
        else {
            ns.takeJob(req.body.truckId, req.params.jobId, (job, err) => {
                if (err) { return res.status(500).send(rb.formatError(500, "Internal server errorr (not your fault)")).end() }
                return res.status(200).send(rb.formatJobs({ job }))
            })
        }  
    })
})

router.post('/api/v1/update-job/:jobId', (req, res) => {
    return res.send('There is nothing here :(')
})

router.post('/api/v1/reciever/check-in', (req, res) => {
    // Check in with unlock code. This confirms the physical location of the truck being at the desitnation.
    ns.recieved(req.body.jobId, req.body["key"], (delivered, err) => {
        if (err) { return res.status(500).send(rb.formatError(500)) }
        if (!delivered && !err) {
            return res.status(200).send(rb.formatError(200,`Could not sign off load ${req.body.jobId}. Is that the correct identifier?`))
        }
        else if (delivered) {
            console.log("")
            return res.status(200).send({ "data": { "delivered": delivered }})
        }
        else if (!delivered) {
            return res.status(200).send(rb.formatError(200, `Could not sign off load ${req.body.jobId}. Is that the correct key?`))
        }
        else {
            return res.status(300).send(rb.formatError(300, "Could not sign off load due to unknown issues. Please contact support for help"))
        }
    })
})

module.exports = router