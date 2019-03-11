// nospoof core
const Firestore = require('@google-cloud/firestore')
const admin = require('firebase-admin')

const firestore = new Firestore({
    projectId: 'starterhacks-2019-228422',
    keyFilename: '/Users/nigelhuang/Downloads/hack-lassonde-5b7b0e907852.json',
})

const trucks = firestore.collection('trucks')
const jobs = firestore.collection('jobs')

module.exports.isOnRoute = function (truckId, cb) {
    var t = trucks.doc(truckId)
    t.get()
        .then(tDoc => {
        if (!tDoc.exists) {
            console.log(`Truck id: ${truckId}: Does not exist`)
            return cb(null, null)
        }
        else {
            if (tDoc.data().onRoute) {
                console.log(`Truck id: ${truckId}: Request isOnRoute = true`)
                return cb(true, null)
            } else {
                console.log(`Truck id: ${truckId}: Request isOnRoute = false`)
                return cb(false, null)
            }
        }})
        .catch(err => {
            console.log('Error getting document', err)
            return cb(null, err)
        })
}

module.exports.takeJob = function (truckId, jobId, cb) {
    var t = trucks.doc(truckId)
    var j = jobs.doc(jobId)

    t.get()
        .then(tDoc => {
            if (!tDoc.exists) {
                console.log(`Truck id: ${truckId}: Truck id does not exist`)
                return cb(null, null)
            }
            j.get()
                .then(jDoc => {
                    if (!jDoc.exists) {
                        console.log(`Job id: ${jobId}: Job id does not exist`)
                        return cb(null, null)
                    }
                    var selectedJob = jDoc.data()
                    // var selectedTruck = tDoc.data()
                    // Update truck and job
                    const unlockKey = Math.floor(Math.random()*90000) + 10000
                    t.update({ onRoute: true, currentJob: j.id, key: unlockKey })
                    j.update({ driver: t.id, key: unlockKey })

                    console.log(`Job id: ${jobId}: Job id taken by truck id ${truckId}. Key: ${unlockKey}`)
                    // Take the job off the listing
                    return cb(selectedJob, null)
                })
                .catch(err => { return cb(null, err) })
        })
}

module.exports.getJobs = function (truckId, cb) {
    // TODO: Need to retrieve jobs near truck location!
    //var j  = jobs.doc(truckId)
    let res = []
    jobs.get()
        .then(snapshot => {
            snapshot.forEach(doc => {
                res.push({
                    ...doc.data(),
                    jobId: doc.id
                })
            });
            return cb(res, null)
        })
        .catch(err => {
            console.log('Error retrieving job documents', err)
            return cb(null, err)
        })
}

module.exports.recieved = function(jobId, key, cb) {
    var j = jobs.doc(jobId)

    j.get()
    .then(jDoc => {
            if (!jDoc.exists) {
                console.log(`Job id: ${jobId}: Job id does not exist. Could not sign off on load ${jobId}`)
                return cb(null, null)
            }
            // Find truck profile, and verify key
            trucks.doc(jDoc.data().driver).get()
            .then(tDoc => {
                if (!tDoc.exists) {
                    console.log(`No driver exists. Could not sign off on load ${jobId}`)
                    return cb(null, null)
                }

                var profile = tDoc.data()
                if (parseInt(profile.key) === parseInt(key)) {
                    t.update({
                        key: '',
                        onRoute: false,
                        history: admin.firestore.FieldValue.arrayUnion(j.id)
                    })
                    .then(() => {
                        console.log(`Truck id: ${profile.id}: ${jobId} completed`)
                        j.update({ status: "completed "})
                        .then(() => {
                            console.log(`Job id: ${jobId}: Successfully updated to status 'completed'`)
                            // If delivered, then send back the delivery date
                            var del = new Date(tDoc.delivered)
                            var datestring = `${del.getMonth() + 1}-${del.getDate()}-${del.getFullYear()}`
                            return cb({ "data": { "delivered": datestring }}, null)
                        })
                    })
                    .catch(err => {
                        console.error(`Error updating truck profile to complete job ${jobId}`)
                        return cb(null, err)
                    })
                }
                return cb(false, null)
            }).catch(err => console.log(err))
        }
    )
}

module.exports.loadStatus = function(jobId, cb) {
    var j = jobs.doc(jobId)

    j.get()
    .then(jDoc => {
        if (!jDoc.exists) {
            console.log(`Job id: ${jobId}: Request for loadStatus: Job id does not exist`)
            return cb(null, null)
        }
        var doc = jDoc.data()
        console.log(`Job id: ${jobId}: Request for loadStatus: delivered: ${doc.delivered ? true: `FALSE. KEY: ${doc.key}`}`)
        return cb({ "data": doc }, null)
        // var t = trucks.where('currentJob', '==', jobId)
        // t.get()
        // .then(tDoc => {
        //     if (!tDoc.exists) {
        //         console.log(`Job id: ${jobId} Has truck id that does not exist. There could be no driver assigned to this load. Could not query for load information`)
        //         return cb(null, null)
        //     }
        //     // Now we have the truck's unlock key
        //     const key = tDoc.data().key
        //     console.log(key)
        //     var doc = jDoc.data()
        //     console.log(`Job id: ${jobId}: Request for loadStatus: delivered: ${doc.delivered ? true: `FALSE. KEY: ${key}`}`)
        //     if (!doc.delivered) { return cb({ "data": { "delivered": false, "key": key } }, null) }
            
        //     // If delivered, then send back the delivery date and key
        //     var del = new Date(tDoc.delivered)
        //     var datestring = `${del.getMonth() + 1}-${del.getDate()}-${del.getFullYear()}`
        //     return cb({"data": { "delivered": datestring, "key": key}}, null)
        // })
    })
}

module.exports.getTruck = function(truckId, cb) {
    var t = trucks.doc(truckId)

    t.get()
    .then(tDoc => {
        if (!tDoc.exists) {
            console.log(`Truck id: ${truckId}: Truck id does not exist. Could not sign off on load ${jobId}`)
            return cb(null, null)
        }
        return cb(tDoc.data(), null)
    })
}

module.exports.getJob = function(jobId, cb) {
    var j = jobs.doc(jobId)

    j.get()
    .then(jDoc => {
        if (!jDoc.exists) {
            console.log(`Job id does not exist ${jobId}`)
            return cb(null, null)
        }
        return cb(jDoc.data(), null)
    })
}