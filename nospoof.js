// nospoof core
const Firestore = require('@google-cloud/firestore')

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
            console.log('No such document!')
        }
        else {
            if (doc.data().onRoute) {
                return cb(true, null)
            } else {
                return cb(false, null)
            }
        }})
        .catch(err => {
            console.log('Error getting document', err);
            return cb(null, err)
        });
}

module.exports.getJobs = function (truckId, cb) {
    //var j  = jobs.doc(truckId)
    jobs.get()
        .then(snapshot => {
            snapshot.forEach(doc => {
                return cb(doc.data(), null)
            });
        })
        .catch(err => {
            console.log('Error retrieving job documents', err);
            return cb(null, err)
        })
}