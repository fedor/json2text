(function() {
var _ = require('lodash');
var f = require('find');
var fs = require('fs');
var fsmonitor = require('fsmonitor');

var changes_handler = function(changes, out_ext, handler) {
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

exports.mon = function(path, in_ext, out_ext, handler, post_process) {
	var regexp = new RegExp('.'+in_ext+'$', 'i');

	if (!_.isArray(post_process)) post_process = [];
	for (var i = 0; i < post_process.length; i++) {
		post_process[i][0] = new RegExp('.'+post_process[i][0]+'$', 'i');
	};
	
	var monitor = fsmonitor.watch(path, {
		matches:  function(relpath) { return relpath.match( regexp ) !== null; }, // /\.cjson$/i
		excludes: function(relpath) { return false; }
	});

	var files = f.fileSync(regexp, path);
	changes_handler(files, out_ext, handler);

	monitor.on('change', function(change) {
		var changes = change.addedFiles.concat(change.modifiedFiles);
		for (var i = 0; i < changes.length; i++) {
			changes[i] = path+'/'+changes[i];
		}
		changes_handler(changes, out_ext, handler);
		
		for (var i = 0; i < post_process.length; i++) {
			var args = post_process[i];
			var files = f.fileSync(args[0], path);
			changes_handler(files, args[1], args[2]);
		};
	});
};
})();
