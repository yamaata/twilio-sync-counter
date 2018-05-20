const sync = Runtime.getSync() // eslint-disable-line no-undef

const mapName = 'xxx'
const key = 'xxx'
const ttl = 300 // In the range [1, 31536000(1year)], or 0 for infinity.

exports.handler = (context, event, callback) => {
  [
    createSyncMap,
    createSyncMapItem,
    countUp,
    count => callback(null, String(count))
  ].reduce((promise, func) => {
    return promise.then(func)
  }, Promise.resolve())
    .catch(err => callback(err))
}

/**
 * create sync map if not exists.
 *
 * @returns {Promise}
 */
function createSyncMap () {
  return new Promise((resolve, reject) => {
    sync.maps.create({
      uniqueName: mapName
    }).then(map => {
      resolve()
    }).catch(() => {
      resolve()
    })
  })
}

/**
 * create sync map item if not exists.
 *
 * @returns {Promise}
 */
function createSyncMapItem () {
  return new Promise((resolve, reject) => {
    sync.maps(mapName).syncMapItems.create({
      key: key,
      data: {
        count: 0
      },
      ttl: ttl
    }).then(item => {
      resolve()
    }).catch(() => {
      resolve()
    })
  })
}

/**
 * count up sync map item.
 *
 * @returns {Promise}
 */
function countUp () {
  return new Promise((resolve, reject) => {
    const mapItem = sync.maps(mapName).syncMapItems(key)
    mapItem.fetch()
      .then(item => {
        let count = item.data.count + 1
        if (new Date(item.dateExpires) <= Date.now()) {
          // initialize if expire date has passed.
          count = 1
        }
        mapItem.update({
          data: {
            count: count
          },
          ttl: ttl
        }).then(item => {
          resolve(item.data.count)
        }).catch(err => {
          reject(err)
        })
      }).catch(err => {
        reject(err)
      })
  })
}
