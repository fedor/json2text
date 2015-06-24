#! /usr/bin/env node

var _       = require('lodash');
var fs      = require('fs');
var process = require('process');

var files    = {};
var elements = {};
var basedir  = process.cwd();

var r = function(p) {
	try {
		var j = JSON.parse(fs.readFileSync(p, {'encoding': 'utf8'}));
		if (!_.isArray(j)) j = [j];
		return j;
	} catch (e) {
		console.log(p+' not JSON!');
		return [];
	}
}

var get_attrs = function(e) {
	var r = {};
	_.each(e, function(def_value, attr) {
		if (attr && attr[0] != '_') r[attr] = def_value;
	});
	return r;
}

var upd_elems = function(path) {
	var j = r(path);
	//console.log('>>upd elems! ' + JSON.stringify(j, null, 4));

	j.forEach(function(e) {
		try {
			if (!_.isObject(e)) throw JSON.stringify(e)+' is invalid. skipped'
			if (!e._name)       throw JSON.stringify(e)+': _name missed. skipped'
			if (!e._text)       throw e._name+': _text missed. skipped'
		
			elements[e._name] = {
				text: e._text,
				attrs: get_attrs(e)
			}
			console.log('\t'+e._name+': loaded');
		} catch(err) {
			console.log('\twarn: '+err);
		}
	});

	//console.log( 'elements: '+JSON.stringify(elements, null, 4) );
};

var use_template = function(element, node, base_payload) {
	//console.log( 'element: '+JSON.stringify(element, null, 4) );
	//console.log( 'node:    '+JSON.stringify(node, null, 4) );
	//console.log( 'base:    '+JSON.stringify(base_payload, null, 4) );
	try {
		var payload = _.extend( _.cloneDeep(element.attrs), _.omit(node, ['_node', '_child']), {'_text': base_payload} );
		// console.log( 'payload = '+JSON.stringify(payload, null, 4) );
		_.templateSettings.interpolate = /%%([\s\S]+?)%%/g;
		return _.template(element.text)(payload); // '%%<INPUT>%%');
	} catch (err) {
		throw node._node+': compilation failed: '+err+'. skipped'
	}
};

var compile = function(path, parent_template) {
	var j = path;
	if (!_.isArray(j)) j = r(j);
	//console.log('compile! ' + JSON.stringify(j, null, 4));

	var base_parts = []
	j.forEach(function(n) {
		try {
			if (!_.isObject(n))                     throw JSON.stringify(n)+' is invalid. skipped'
			if (!n._node)                           throw JSON.stringify(n)+': node missed. skipped'
			if (!n._child && !_.isString(n._child)) throw n._node+': child missed. skipped'
		
			var t = n._node;
			var c = n._child;
			var e = elements[t];
			if (!e) throw t+': unknown element. skipped'
			
			var base_part = null;
			if ( _.isString(c) ) base_part = c;
			else {
				if (!_.isArray(c)) c = [c];
				base_part = compile(c, parent_template);
			}
			base_part = use_template(e, n, base_part);
			base_parts.push(base_part);
		} catch (err) {
			console.log('\twarn: '+err);
		}
	});

	return base_parts.join('');
};

var m = require('./lib/mon');
var out_ext = process.argv[2] || 'out';
m.mon(basedir, 'j2.node.json', null, upd_elems, [['j2.json', out_ext, compile]]);
m.mon(basedir, 'j2.json', out_ext, compile);
