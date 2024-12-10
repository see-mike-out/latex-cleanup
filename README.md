# Clean up your latex file

Do you want to avoid adding your comments? Clean them up!

## Cautions

Use at your own risk! It is not thoroughly tested. I recommend using this when you submit your Latex source files rather than clean-up version.

This script ignores any non-Latex files, so once files are generated, copy and paste them to the original directory. 

If you fork this repo, any `*.tex` files are git-ignored.

## Requirement

- Latest stable version of Node

## How?

1. Add your tex files in the `data` directory (you can choose another directory of your choice).

2. Open `src/run.js` and configure the object:

```js
lib.cleanup({
  dir_in: 'data', // directory for the tex files, if not provided, it won't work
  dir_out: 'output', // directory for the tex files (default)
  revision: 'revised', // the command for marking revised parts, if not provided then ignored
  removal: 'cut', // the commond for marking removed parts, if not provided then ignored
  delete_comments: true, // default
});
```

3. Run `node src/run.js`.
