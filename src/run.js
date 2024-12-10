const lib = require("./clean.js");

lib.cleanup({
  dir_in: 'data', // directory for the tex files
  dir_out: 'output', // directory for the tex files
  revision: 'revised', // the command for marking revised parts
  removal: 'cut', // the commond for marking removed parts
  delete_comments: true, // default
});