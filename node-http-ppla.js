var http = require('http');
var fs = require('fs');
var querystring = require('querystring');

var printer = fs.createWriteStream('/home/neis/lp0');

printer.on('error', function() {
    console.log('Error opening /dev/usb/lp0');
});

authToken = process.argv[2];

var server = http.createServer(function(request, response) {

        console.log((new Date()) + ' Connection accepted.');

        request.content = '';

        request.addListener("data", function(chunk) {
            request.content += chunk;
        });

        request.addListener("end", function() {

            var postData = querystring.parse(request.content);

            console.log(postData);

            if (('auth_token' in postData) && postData.auth_token == authToken) {

                if (! 'base_commands' in postData) {

                    console.log('No base commands');
                    response.writeHead(500);
                } else {

                    if (! 'label_commands' in postData) {

                        console.log('No label commands');
                        response.writeHead(500);
                    } else {

                        var base_commands = [];

                        var postDataBaseCommands = querystring.parse(postData.base_commands);

                        Object.keys(postDataBaseCommands).forEach(function(key) {
                            var bc = postDataBaseCommands[key]
                            base_commands.push(Buffer.concat([new Buffer([0x02], 'hex'),  new Buffer(bc)]));
                        });

                        base_commands.push(Buffer.concat([new Buffer([0x02], 'hex'),  new Buffer('L')]));

                        var label_commands = [];

                        var postDataLabelCommands = querystring.parse(postData.label_commands);

                        Object.keys(postDataLabelCommands ).forEach(function(key) {
                            var lc = postDataLabelCommands[key];
                            label_commands.push(new Buffer(lc));
                        });

                        for (var c in base_commands) {
                            printer.write(base_commands[c]);
                            printer.write(new Buffer([0x0D], 'hex')); // <CR>
                        }

                        for (var c in label_commands) {
                            printer.write(label_commands[c]);
                            printer.write(new Buffer([0x0D], 'hex')); // <CR>
                        }

                        printer.write(new Buffer('Q0001')); // Quantity
                        printer.write(new Buffer('E')); // end label
                        printer.write(new Buffer([0x0D], 'hex')); // <CR>

                        response.writeHead(200, {"Content-Type": "text/plain"});
                    }
                }
            } else {
                console.log('No or invalid auth token');
                response.writeHead(500);
            }

            response.end();
        });

}).listen(8080);
console.log('server up');
