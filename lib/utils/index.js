/**
 * Convert bytes to a human readable string.
 * @param {Number} bytes 
 * @param {Number} precision 
 * @param {Number} si 
 * @returns 
 */
function bytesToSize(bytes, precision, si)
{
	var ret;
	si = typeof si !== 'undefined' ? si : 0;
	if(si != 0) {
		var kilobyte = 1000;
		var megabyte = kilobyte * 1000;
		var gigabyte = megabyte * 1000;
		var terabyte = gigabyte * 1000;
	} else {
		var kilobyte = 1024;
		var megabyte = kilobyte * 1024;
		var gigabyte = megabyte * 1024;
		var terabyte = gigabyte * 1024;
	}
	if ((bytes >= 0) && (bytes < kilobyte)) {
		return bytes + ' B';
	} else if ((bytes >= kilobyte) && (bytes < megabyte)) {
		ret = (bytes / kilobyte).toFixed(precision) + ' K';
	} else if ((bytes >= megabyte) && (bytes < gigabyte)) {
		ret = (bytes / megabyte).toFixed(precision) + ' M';
	} else if ((bytes >= gigabyte) && (bytes < terabyte)) {
		ret = (bytes / gigabyte).toFixed(precision) + ' G';
	} else if (bytes >= terabyte) {
		ret = (bytes / terabyte).toFixed(precision) + ' T';
	} else {
		return bytes + ' B';
	}
	if(si != 0) {
		return ret + 'B';
	} else {
		return ret + 'B';
	}
}

module.exports = {
    bytesToSize: bytesToSize
}