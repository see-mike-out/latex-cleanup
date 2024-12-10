const fs = require('fs/promises');

const comment = "%";

async function cleanup(config = {}) {
  let dir = config.dir_in,
    out = config.dir_out,
    revision = config.revision,
    removal = config.removal,
    del_com = config.delete_comments ?? true;

  if (!dir) console.error("no directory provided");

  let revision_command = (revision ? `\\${revision}` : null),
    removal_command = (removal ? `\\${removal}` : null);

  let filepaths = await getDirectories(dir);
  console.log(filepaths)

  for (const path of filepaths) {
    await cleanupSingle(path, dir, out, revision_command, removal_command, del_com);
  }
}

async function getDirectories(dir) {
  let directories = [];
  let files = await fs.readdir(dir);
  for (const filename of files) {
    let path = `${dir}/${filename}`;
    let stats = await fs.stat(path);
    if (stats.isFile() && path.endsWith(".tex")) {
      directories.push(path);
    } else if (stats.isDirectory()) {
      let sub_dirs = await getDirectories(path);
      directories.push(...sub_dirs);
    }
  }

  return directories;
}

async function cleanupSingle(path, dir, out, revision_command, removal_command, del_com) {
  let outpath = path.replace(new RegExp(`^${dir}/`), out + "/");
  let out_dir = outpath.split("/").slice(0, -1).join("/");
  console.log(out_dir);
  let text = await fs.readFile(path, 'utf-8');

  // remove comments
  let out_text_0 = "";
  if (del_com) {
    let s = -1, e = -1;
    for (let i = 0; i < text.length; i++) {
      if (s < 0 && text[i] === comment) {
        s = i;
      }
      if (s >= 0 && text[i] == "\n") {
        e = i;
      }
      if (s < 0) {
        out_text_0 += text[i];
      }
      if (s >= 0 && e >= 0) {
        s = -1;
        e = -1;
      }
    }
  } else {
    out_text_0 = text;
  }

  // remove cuts
  let out_text_1 = "";
  if (removal_command) {
    let s = -1, e = -1, temp_command = "", braket_depth = 0, remove = false, just_removed = false;
    for (let i = 0; i < out_text_0.length; i++) {
      if (s < 0 && out_text_0[i] === "\\" && braket_depth == 0) {
        s = i;
        temp_command += out_text_0[i]
      } else if (s >= 0 && out_text_0[i] === "{" && braket_depth == 0) {
        if (temp_command === removal_command) {
          remove = true;
          braket_depth = 1;
        } else {
          out_text_1 += temp_command + "{";
          remove = false;
          s = -1;
          e = -1;
          temp_command = "";
          braket_depth = 0;
        }
      } else if (s >= 0 && out_text_0[i] === " " && braket_depth == 0) {
        out_text_1 += temp_command + " ";
        remove = false;
        s = -1;
        e = -1;
        temp_command = "";
        braket_depth = 0;
      } else if (s >= 0 && braket_depth == 0) {
        temp_command += out_text_0[i]
      } else if (s >= 0 && braket_depth == 1 && out_text_0[i] === "}") {
        braket_depth -= 1;
        if (remove) {
          remove = false;
          s = -1;
          e = -1;
          temp_command = "";
          braket_depth = 0;
          just_removed = true;
        }
      } else if (s >= 0 && braket_depth > 0) {
        if (out_text_0[i] === "{") braket_depth += 1;
        else if (out_text_0[i] === "}") braket_depth -= 1;
      } else if (just_removed && out_text_0[i] === "\n") {
        just_removed = false;
      } else {
        out_text_1 += out_text_0[i];
      }
    }
  } else {
    out_text_1 = out_text_0;
  }

  // remove revision tags
  let out_text_2 = "";
  if (revision_command) {
    let s = -1, e = -1, temp_command = "", braket_depth = 0, remove = false;
    for (let i = 0; i < out_text_1.length; i++) {
      if (s < 0 && out_text_1[i] === "\\" && braket_depth == 0) {
        s = i;
        temp_command += out_text_1[i]
      } else if (s >= 0 && out_text_1[i] === "{" && braket_depth == 0) {
        if (temp_command === revision_command) {
          remove = true;
          braket_depth = 1;
        } else {
          out_text_2 += temp_command + "{";
          remove = false;
          s = -1;
          e = -1;
          temp_command = "";
          braket_depth = 0;
        }
      } else if (s >= 0 && out_text_1[i] === " " && braket_depth == 0) {
        out_text_2 += temp_command + " ";
        remove = false;
        s = -1;
        e = -1;
        temp_command = "";
        braket_depth = 0;
      } else if (s >= 0 && braket_depth == 0) {
        temp_command += out_text_1[i]
      } else if (s >= 0 && braket_depth == 1 && out_text_1[i] === "}") {
        braket_depth -= 1;
        if (remove) {
          remove = false;
          s = -1;
          e = -1;
          temp_command = "";
          braket_depth = 0;
        }
      } else if (s >= 0 && braket_depth > 0) {
        if (out_text_1[i] === "{") braket_depth += 1;
        else if (out_text_1[i] === "}") braket_depth -= 1;
        out_text_2 += out_text_1[i];
      } else {
        out_text_2 += out_text_1[i];
      }
    }
  } else {
    out_text_2 = out_text_1;
  }

  try {
    await fs.mkdir(out_dir, { recursive: true });
    console.log(`Directory created successfully: ${out_dir}`);
  } catch (err) {
    if (err.code !== 'EEXIST') { // Ignore error if directory already exists
      console.error(`Error creating directory: ${err}`);
      throw err;
    }
  }

  await fs.writeFile(outpath, out_text_2, { encoding: 'utf-8' });
}

module.exports = { cleanup };