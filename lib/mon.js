(function() {
var f = require('find');
var fs = require('fs');
var fsmonitor = require('fsmonitor');

exports.mon = function(path, in_ext, out_ext, handler) {
	var regexp = new RegExp('.'+in_ext+'$', 'i');
	
	var monitor = fsmonitor.watch(path, {
		matches:  function(relpath) { return relpath.match( regexp ) !== null; }, // /\.cjson$/i
		excludes: function(relpath) { return false; }
	});

	var changes_handler = function(changes) {
		for (var i = 0; i < changes.length; i++) {
			var input_path = changes[i]
			console.log('info: '+input_path+' changed...');
			var result = handler(input_path);
			if (out_ext) {
				input_path = input_path.split(".")
				input_path = input_path.slice(0, input_path.length-2).join("");
			
				var result_path = input_path+'.'+out_ext;
				if (result) {
					fs.writeFileSync(result_path, result);
					console.log('\t'+result_path+' saved');
				} else {
					console.log('\t'+result_path+' save skipped');
				}
				continue;
			}
			console.log('\t'+input_path+' loaded');
		}
	};

	var files = f.fileSync(regexp, path);
	changes_handler(files);

	monitor.on('change', function(change) {
		var changes = change.addedFiles.concat(change.modifiedFiles);
		for (var i = 0; i < changes.length; i++) {
			changes[i] = path+'/'+changes[i];
		}
		changes_handler(changes);
	});
};
})();
