// nospoof core
const Firestore = require('@google-cloud/firestore')

const firestore = new Firestore({
    projectId: 'starterhacks-2019-228422',
    keyFilename: '/Users/nigelhuang/Downloads/hack-lassonde-5b7b0e907852.json',
})

const trucks = firestore.collection('trucks')
const jobs = firestore.collection('jobs')

module.exports.isOnRoute = async (truckId) => {
    var t = trucks.where('name', '==', 'NakLrvNzjDx5TDcbzWjM')
        .then(doc => {
            console.log(doc.data())
        })
    var cityRef = db.collection('cities').doc('SF');
    var getDoc = cityRef.get()
        .then(doc => {
        if (!doc.exists) {
            console.log('No such document!');
        } else {
            console.log('Document data:', doc.data());
        }
        })
        .catch(err => {
        console.log('Error getting document', err);
        });
}

module.exports.getJobs = async (truckId) => {
    var j = jobs.get()
}