var path = require('path');
var os = require('os');
var fs = require('fs-extra');
var cp = require('child_process');
var exec = cp.exec;
var sqawn = cp.sqawn;

var required_file_win = [
   'ffmpegsumo.dll',
   'icudt.dll',
   'libEGL.dll',
   'libGLESv2.dll',
   'nw.exe',
   'nw.pak'
];

var required_file_linux = [
  'nw',
  'nw.pak',
  'libffmpegsumo.so'
];

var required_file_macox = [
  'node-webkit.app'
];

var source_file = ['index.html', 'package.json'];

var exec_root = path.dirname(process.execPath);
var required_file;
if (os.platform() == 'win32') {
  required_file = required_file_win;
}
if (os.platform() == 'linux') {
  required_file = required_file_linux;
}
if (os.platform() == 'darwin') {
  required_file = required_file_macox;
  if (~exec_root.indexOf("Helper.app"))
    exec_root = path.join(exec_root, '..', '..', '..')
  exec_root = path.normalize(
      path.join(exec_root, '..', '..', '..'));
}



exports.getExecPath = function() {
  if (os.platform() == 'win32') {
    return path.join('tmp-nw', 'nw.exe');
  }
  if (os.platform() == 'linux') {
    return path.join('tmp-nw', 'nw');
  }
  if (os.platform() == 'darwin') {
    return path.join('tmp-nw', 'node-webkit.app', 'Contents', 'MacOS', 'node-webkit');
  }

}

function copyExecFiles(done) {
  fs.mkdir('tmp-nw', function(err) {
    if(err && err.code !== 'EEXIST') throw err;
    var files_done = 0;
    for (var i in required_file) {
      var src_file = path.join(exec_root, required_file[i]);
      var dst_file = path.join('tmp-nw', required_file[i]);
      fs.copy(src_file, dst_file, function(err) {
        if(err) throw err;
        if(++files_done === required_file.length) done();
      });
    }
  });

}

exports.copySourceFiles = function(folder) {
  if (folder == undefined)
	folder = 'start_app';
  fs.createReadStream(global.tests_dir + '/' + folder + '/index.html').pipe(
      fs.createWriteStream('tmp-nw/index.html'));
  fs.createReadStream(global.tests_dir + '/' + folder + '/package.json').pipe(
      fs.createWriteStream('tmp-nw/package.json'));

}

exports.zipSourceFiles = function(callback) {
  exec('python automatic_tests/start_app/zip.py');
  setTimeout(callback, 2000);
}

exports.makeExecuableFile = function() {
  if (os.platform() == 'win32') {
    cp.exec('copy /b nw.exe+app.nw app.exe', {cwd: './tmp-nw/'});
  }
  if (os.platform() == 'linux') {
    cp.exec('cat nw app.nw > app && chmod +x app', {cwd: './tmp-nw/'});
  }

}


exports.copyExecFiles = copyExecFiles;
