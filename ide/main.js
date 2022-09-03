const express = require('express');
const app = express();
const multer = require('multer');
const server = require('http').Server(app)
const io = require('socket.io')(server)
const exec = require('child_process').exec;
const execSync = require('child_process').execSync;
const spawnSync = require('child_process').spawnSync;
const spawn = require('child_process').spawn;
const fs = require('fs');
const path = require('path');
const port = process.argc > 2 ? Number(process.argv[2]):50000;
const codeExec = {
  python: 'python3',
  shell: 'sh',
};

const protectList = [
  'openpibo-tools',
  'openpibo-files',
  'node_modules',
  'package.json',
  'package-lock.json',
  'mymotion.json',
  'config.json',
];

let record = '';
let ps = undefined;

let PATH = '/home/pi';
let codeText = '';
let codePath = '';

const sleep = (t) => {
  return new Promise(resolve=>setTimeout(resolve,t));
}

class Mutex {
  constructor() {
    this.lock = false;
  }
  async acquire() {
    while(true) {
      if (this.lock === false) break;
      await sleep(100);
    }
    this.lock = true;
  }
  release() {
    this.lock = false;
  }
}
const mutex = new Mutex();

const execute = async(EXEC, codepath) => {
  await mutex.acquire();
  return new Promise((res, rej) => {
    record = '[' + new Date().toString().split(' GMT')[0] + ']: $ sudo ' + EXEC + ' ' + codepath + ' >> \n\n';
    io.emit('update', {'record':record});

    ps = (EXEC == 'python3')?spawn(EXEC, ['-u', codepath]):spawn(EXEC, [codepath]); // python3/sh
    ps.stdout.on('data', (data) => {
      record += data.toString();
      io.emit('update', {'record':record});
    });

    ps.stderr.on('data', (data) => {
      record += data.toString();
      io.emit('update', {'record':record});
    });

    ps.on('error', (err) => {
      record += err.toString();
      io.emit('update', {'record':record});
    });

    ps.on('close', (code) => {
      record += "\n종료됨.";
      io.emit('update', {'record':record, 'exit':true});
      res(mutex.release());
    });
  });
}

const readDirectory = (d) => {
  let dlst = [];
  let flst = [];

  fs.readdirSync(d, {withFileTypes:true}).forEach(p => {
    if(p.isDirectory()) dlst.push({name:p.name, type:"folder", protect:isProtect(`${d}/${p.name}`)});
    else flst.push({name:p.name, type:"file", protect:isProtect(`${d}/${p.name}`)});
  });

  return dlst.concat(flst);
}

server.listen(port, () => {
  execSync('v4l2-ctl -c vertical_flip=1,horizontal_flip=1,white_balance_auto_preset=3');
  console.log('Server Start: ', port);
});

app.use('/static', express.static(__dirname + '/static'));
app.use('/webfonts', express.static(__dirname + '/webfonts'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/templates/index.html')
});

app.get('/download', (req, res) => {
  res.download(PATH + "/" + req.query.filename); 
});

let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, PATH);
  },
  filename: function (req, file, cb) {
    file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8')
    let name = file.originalname.replace(/ /g, "_");
    cb(null, name);
  }
});

let upload = multer({ storage: storage })

app.post('/upload', upload.single('data'), (req, res) => {
  io.emit('update_file_manager', {data: readDirectory(PATH)});
  execSync('chown -R pi:pi ' + PATH);
  res.status(200).end();
});

const isProtect = (p) => {
  for(idx in protectList) {
    if (p.includes(protectList[idx])) return true;
  }
  return false; 
}

io.on('connection', (socket) => {
  socket.on('init', () => {
    fs.readFile(codePath, (err, data) => {
      if(!err) codeText = data.toString()
      else codeText = '';
      io.emit('init', {codepath: codePath, codetext:codeText, path:PATH});
    });
  });

  socket.on('load_directory', function(p) {
    PATH = p;
    io.emit('update_file_manager', {data: readDirectory(PATH)});
  });

  socket.on('stop', () => {
    exec('pkill play');
    if(ps) ps.kill('SIGKILL');
  });

  socket.on('view', (p) => {
    fs.readFile(p, (err, data) => {
      if(!err) io.emit('update', {image:Buffer.from(data).toString('base64')/*, dialog:'불러오기 완료: ' + p*/});
      else io.emit('update', {dialog:'오류: ' + err.toString()});
    });
  });
  
  socket.on('play', (p) => {
    fs.readFile(p, (err, data) => {
      if(!err) io.emit('update', {audio:Buffer.from(data).toString('base64')/*, dialog:'불러오기 완료: ' + p*/});
      else io.emit('update', {dialog:'오류: ' + err.toString()});
    });
  });

  //load 
  socket.on('load', (p) => {
    fs.readFile(p, (err, data) => {
      if(!err) io.emit('update', {code: data.toString()/*, dialog:'불러오기 완료: ' + p*/});
      else io.emit('update', {code:'', dialog:'불러오기 오류: ' + err.toString()});
    });
  });

  socket.on('system', () => {
    io.emit('system', execSync('/home/pi/openpibo-tools/ide/system.sh').toString().split(','));
  });

  socket.on('delete', (d) => {
    if (isProtect(d)) {
      io.emit('update', {dialog:'파일 삭제 오류: 보호 파일입니다.'});
      return;
    }
    if (d == codePath) {
      codePath = "";
      codeText = "";
    }
    execSync("rm -rf " + d);
    io.emit('update_file_manager', {data: readDirectory(PATH)});
  });

  socket.on('add_file', (p) => {
    if (isProtect(p)) {
      io.emit('update', {dialog:'파일 생성 오류: 보호 파일입니다.'});
      return;
    }
    codePath = p;
    fs.exists(p, function(exists) {
      try {
        if(!exists) {
          execSync('mkdir -p ' + path.dirname(p));
          execSync('touch ' + p);
          execSync('chown -R pi:pi ' + path.dirname(p));
          io.emit('update_file_manager', {data: readDirectory(PATH)});
        }
      } catch (err) {
        io.emit('update', {code:'', dialog:'파일 생성 오류: ' + err.toString()});
        return;
      }

      fs.readFile(p, (err, data) => {
        if(!err) io.emit('update', {code: data.toString(), dialog:'불러오기 완료: ' + p});
        else io.emit('update', {code:'', dialog:'불러오기 오류: ' + err.toString()});
      });
    });
  });

  socket.on('add_directory', (p) => {
    if (isProtect(p)) {
      io.emit('update', {dialog:'디렉토리 생성 오류: 보호 파일입니다.'});
      return;
    }

    fs.exists(p, function(exists) {
      try {
        if(!exists) {
          execSync('mkdir -p ' + p);
          execSync('chown -R pi:pi ' + p);
          io.emit('update_file_manager', {data: readDirectory(PATH)});
        }
      } catch (err) {
        io.emit('update', {code:'', dialog:'디렉토리 생성 오류: ' + err.toString()});
        return;
      }
    });
  });

  socket.on('save', (d) => {
    try {
      codeText = d['codetext'];
      codePath = d['codepath'];

      if (isProtect(codePath)) {
        io.emit('update', {dialog:'파일 저장 오류: 보호 파일입니다.'});
        return;
      }
      execSync('mkdir -p ' + path.dirname(codePath));
      fs.writeFileSync(codePath, codeText);
      execSync('chown -R pi:pi ' + path.dirname(codePath));
    } catch (err) {
      io.emit('update', {code:'', dialog:'파일 저장 오류: ' + err.toString()});
    }
  });

  socket.on('execute', async (d) => {
    try {
      codeText = d['codetext'];
      codePath = d['codepath'];

      if (isProtect(codePath)) {
        io.emit('update', {dialog:'실행 오류: 보호 파일입니다.'});
        return;
      }

      if(ps) ps.kill('SIGKILL');
      execSync('mkdir -p ' + path.dirname(codePath));
      fs.writeFileSync(codePath, codeText);
      execSync('chown -R pi:pi ' + path.dirname(codePath));
      await execute(codeExec[d["codetype"]], codePath);
    } catch (err) {
      io.emit('update', {code:'', dialog:'실행 오류: ' + err.toString(), 'exit':true});
    }
  });
});
