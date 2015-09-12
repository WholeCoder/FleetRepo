var Q = require('q');

function sequence(array, callback) {
	return array.reduce(function chain(promise, item) {
		return promise.then(function () {
			return callback(item);
		});
	}, Promise.resolve())
};

var products = ['sk-1','sk-2','sk-3'];

sequence(products, function (sku) {
	return getInfo(sku).then(function (info) {
		console.log(info)
	});
}).catch(function (reason) {
	console.log(reason)
});

function getInfo(sku) {
	console.log('Requesting info for ' + sku);
	var deferred = q.defer();
  	setTimeout(function() {
    	deferred.resolve('hello world');
  	}, 500);

  return deferred;
}