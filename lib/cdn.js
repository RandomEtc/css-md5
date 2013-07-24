/* jshint globalstrict: true, node: true, unused:false */
"use strict";

var debug = require('debug')('cdn'),
    fs = require('fs'),
    path = require('path'),
    crypto = require('crypto');

/*
 * Template helper replaces filenames with hashed versions for infinite cacheability.
 *
 * Middleware rewrites requests for hashed filenames back to the original name so
 * that your app is its own origin server.
 *
 * var CDN = require('./lib/cdn')
 *     cdn = CDN({
 *         prefix: '/my-files-',
 *         url: 'https://my-cdn-url.cloudfront.net'
 *     });
 *
 * // in your express middleware, before templates and static
 * app.use(cdn);
 *
 * // in your templates, whenever you request a file you want fast:
 * <img src="<%=cdn('/path/to/file.png')%>">
 * <link rel="stylesheet" href="<%=cdn('/path/to/file.css')%>">
 * <script src="<%=cdn('/path/to/file.js')%>"></script>
 */
module.exports = function(options) {

    var cdnUrl = options.url || '';
    var prefix = options.prefix || '';
    var staticPath = options.src || (process.cwd() + '/public');

    debug('initialized CDN with prefix, url, root', prefix, cdnUrl, staticPath);

    var cdn = function(req,res,next) {
        res.locals.cdn = cdn.url;
        cdn.rewrite(req,res,next);
    };

    if (!prefix) {
        // noops
        cdn.url = function(url) {
            return url;
        };
        cdn.rewrite = function(a,b,next) {
            return next();
        };
    } else {
        var cache = {};
        // view helper, first time a path is requested will be nasty and slow
        // TODO: build into view compilation so it can be async and implicit?
        cdn.url = function(file, root) {
            if (cache[file]){
                debug('returned cached cdn url for file %s',file);
                return cache[file];
            }
            if (!root && file[0] != '/'){
                throw new Error("cdn helper can't do relative URLs without root path");
            }
            debug('generating cdn url for file %s',file);
            try {
                debug('resolving', root || staticPath, 'to', file);
                var filename = path.resolve(path.join(root || staticPath, file));
                var data = fs.readFileSync(filename);
                var hash = crypto.createHash('md5').update(data).digest('hex');
                var cdnFile = cdnUrl + prefix + hash + filename.replace(staticPath,'');
                cache[file] = cdnFile;
                debug('generated cdn url for file %s is %s',file,cdnFile);
                return cdnFile;
            } catch(e) {
                console.error(e.stack);
                return file;
            }
        };
        var regex = new RegExp(prefix + '[0-9a-f]*');
        // middleware, turns cdn urls back into real file paths in /public
        cdn.rewrite = function(req,res,next){
            if (req.url.indexOf(prefix) === 0) {
                // rewrite URL so that express static will serve the right file
                // TODO: optionally validate the hash and only serve the right thing?
                req.url = req.url.replace(regex,'');
            }
            next();
        };
    }

    return cdn;

};
