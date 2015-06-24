#! /usr/bin/env node
var process = require('process');
try {
	var fs = require('fs');
	if (process.argv[2]) var src = process.argv[2];
	else throw 'file to convert skipped. Abort';
	var out = src+'.j2.node.json';
	var _text = fs.readFileSync(src, {'encoding': 'utf8'});
	var res = {
		"_name": src,
		"_text": _text
	};
	fs.writeFileSync(out, JSON.stringify(res, null, 4));
	console.log(out+' saved');
} catch(e) {
	console.log('ERROR: '+e);
	process.exit(1);
}