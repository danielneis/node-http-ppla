# Node.js HTTP USB PPLA/PPLB Print server

This project aims to create a simple way to use your USB barcode printer via HTTP.

This code depends on usblp linux kernel driver to provide /dev/usb/lp0 interface.

It was tested with an Argox PPLA USB printer.

Usage is simple:

    node http-ppla.js <authToken>

The server will listen on port 8080.

HTTP Requests must be in this format:

    { base_commands: '0=K1503&1=O0220&2=f320',                // STX commands
      label_commands: '0=LCommand1&1=LCommand2&2=LCommand3',  // Label formatting commands,
                                                              // these will be written between L and E commands
      auth_token: 'authTokenExpectedByServer' }               // the authToken configured in the server
