const router = require('express').Router()
const ns = require('./nospoof')
const rb = require('./util/response-builder')

router.get('/', (req, res) => {
    res.send('There is nothing here :(')
})

router.get('/api/v1/jobs', (req, res) => {
    // Send response with list of jobs, if the truck is availble
    ns.isOnRoute('NakLrvNzjDx5TDcbzWjM', (onRoute, err) => {
        if (err) res.send('Internal server error:', err)
        else if (onRoute) {
            res.send('Truck is already on a route!')
        }
        else {
            ns.getJobs('', (jobs, err) => {
                if (err) res.json(rb.formatError(500)).status(500).end()
                console.log(jobs)
                res.json(rb.formatJobs(jobs)).status(200).end()
            })
        }
    })
    
})

router.post('/api/v1/select-job/:jobId', (req, res) => {
    // Only be able to select the job if the are avaiable

    // Set status to on route
})

router.post('api/v1/update-job/:jobId', (req, res) => {
    res.send('There is nothing here :(')
})

router.get('/api/v1/reciever/status', (req, res) => {
    // Send response with current status of their delivery
})

router.post('/api/v1/reciever/check-in', (req, res) => {
    // Check in with unlock code. This confirms the physical location of the truck being at the desitnation.

    // Update truck's history, and set 'on-route' to be false
})

module.exports = router