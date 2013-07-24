css-md5
=======

Walks CSS files and replaces contents of url() dependencies with paths to a CDN.

    $ CDN_PREFIX="/" CDN_URL="https://my-cdn-url.cloudfront.net" ./bin/cssmd5.js public/test.css
    #test{background:url("https://my-cdn-url.cloudfront.net/d41d8cd98f00b204e9800998ecf8427e/images/foo.png");}.other{background-image:url("https://my-cdn-url.cloudfront.net/d41d8cd98f00b204e9800998ecf8427e/images/bar.gif");}

Useful in conjunction with RandomEtc/css-deps and some judicious Makefiles.

