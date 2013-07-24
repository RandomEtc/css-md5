#!/usr/bin/env node
/* jshint globalstrict: true, node: true, unused:false */
"use strict";

var rework = require('rework'),
    path = require('path'),
    fs = require('fs'),
    CDN = require('../lib/cdn'),
    cdn = CDN({
        url: process.env.CDN_URL,
        prefix: process.env.CDN_PREFIX
    });

if (process.argv.length < 3) {
    console.error('usage: md5css <file.css>');
    console.error('');
    console.error('Walks CSS files and replaces contents of url() dependencies with paths to CDN.');
    console.error('Also minifies CSS on output.');
    process.exit(1);
}

var filename = path.resolve(process.argv[2]);
var root = path.dirname(filename);
var data = fs.readFileSync(filename, 'utf8');

function rewrite(url) {
    return cdn.url(url, root);
}

var out = rework(data)
  .use(rework.url(rewrite))
  .toString({ compress: true });

console.log(out);
