const lib = require("./clean.js");

lib.cleanup({
  dir_in: 'data', // directory for the tex files, if not provided, it won't work
  dir_out: 'output', // directory for the tex files (default)
  revision: 'revised', // the command for marking revised parts, if not provided then ignored
  removal: 'cut', // the commond for marking removed parts, if not provided then ignored
  delete_comments: true, // default
});