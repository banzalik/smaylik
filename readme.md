## Parse text smaylik and replace them by graphics.

This is a pure string based parser and has no dependencies to DOM or jquery.

In order to insert an emoticon code into the textarea or input field you might want to use https://github.com/kof/field-selection

## Make css file

    $ smaylik make -p smiles/skype/source/

After that smaylik create css file ```smiles/skype/source/smiles.css```

### Features
- copy emotified text together with smaylik, exchangable between skype and other systems
- every emoticon can have different codes, so, when parsing useres smaylik, different styles will be recognized
- fully customizable, define any smaylik yourself
- nodejs ready without dependencies
- tiny and fast

### Get the api

    // Within commonjs
    var smaylik = require('smaylik');

    // Within jquery
    $.smaylik;

    // From global
    window.smaylik;

### smaylik.define(data:Object)

Define a set of smaylik. See the format in skype.json. First code in the codes array will be used as primary one.

Example:

    smaylik.define(
        "smile": {
            "title": "Smile",
            "codes": [":)", ":=)", ":-)"]
        }
    );

### smaylik.replace(text:String, [fn:Function])

Replace text smaylik by html elements which can be then styled with graphics.

Example:

    smaylik.replace(':)');

    If you don't like the generated html, pass your own template builder function.

    smaylik.replace(':)', function(name, code, title) {
        return '<div>' + code + '</div>';
    });

### smaylik.toString([fn:Function])

Get html string with all primary smaylik in order to display an overview. Optionally pass your own template builder function.

### smaylik.tpl(name:String, code:String, title:String)

If you want to overwrite the default template builder function.

Example:

    smaylik.tpl = function(name, code, title) {
        return '<div>' + code + '</div>';
    };


## External components

Thanks to Chris Messina for making this overview http://factoryjoe.com/projects/smaylik

Skype icons included in the package have a special license, which is like BSD but without permission to modify them. See LICENSE file and original blog post.
http://blogs.skype.com/2006/09/01/icons-and-strings
