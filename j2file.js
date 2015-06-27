#! /usr/bin/env node
var process = require('process');
var f = require('find');
var fs = require('fs');
var path = require('path');
try {
	if (process.argv[2]) var src = process.argv[2];
	else throw 'file to convert skipped. Abort';
	var ext = 'j2.'+(process.argv[3]||'template');
	
	var dir = path.dirname(src) || '.';
	var src_list = JSON.parse( fs.readFileSync(src, {'encoding': 'utf8'}) );
	var dst_list = [];

	fs.mkdirSync(ext);
	src_list.forEach(function(src_obj) {
		var file_name = ext + '/' + src_obj._name + '.' + ext;
		fs.writeFileSync(dir+'/'+file_name, src_obj._text);
		src_obj._file = file_name;
		delete src_obj._text;
		dst_list.push(src_obj);
	});

	fs.writeFileSync(src, JSON.stringify(dst_list, null, 4));
	console.log(src+' saved');
} catch(e) {
	console.log('ERROR: '+e);
	process.exit(1);
}