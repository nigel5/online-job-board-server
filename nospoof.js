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
        .then(doc => {
        if (!doc.exists) {
            console.log(`Truck id: ${truckId}: Does not exist`)
            return cb(null, null)
        }
        else {
            if (doc.data().onRoute) {
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
                    var selectedTruck = tDoc.data()
                    // Update truck and job
                    t.update({ onRoute: true, currentJob: j.id })
                    j.update({ driver: t.id })

                    console.log(`Job id: ${jobId}: Job id taken by truck id ${truckId}`)
                    return cb(selectedJob, null)
                })
        })
}

module.exports.getJobs = function (truckId, cb) {
    // TODO: Need to retrieve jobs near truck location!
    //var j  = jobs.doc(truckId)
    let res = []
    jobs.get()
        .then(snapshot => {
            snapshot.forEach(doc => {
                res.push(doc.data())
            });
            return cb(res, null)
        })
        .catch(err => {
            console.log('Error retrieving job documents', err)
            return cb(null, err)
        })
}

module.exports.recieved = function(truckId, jobId, key, cb) {
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
                var selectedTruck = tDoc.data()
                // Verify the key
                if (selectedTruck.key === key) {
                    t.update({ 
                        onRoute: false,
                        currentJob: '',
                        history: admin.firestore.FieldValue.arrayUnion(j.id)
                    })
                    j.update({ delivered: Date.now() })
                    console.log(`Truck id: ${truckId}: Truck id unlocked`)
                    console.log(`Job id: ${jobId}: job sucessfully delivered`)
                    return cb(true, null)
                }
                else {
                    console.log(`Truck id ${t.id} cannot unlocked`)
                    return cb(false, null)
                }
            })
    })
}
