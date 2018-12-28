const app = require('http').createServer(handler)
const io = require('socket.io')(app);
const uuidv4 = require('uuid/v4');
const Datastore = require('@google-cloud/datastore');

app.listen(8080);

const projectId = 'kyoko-land';
io.set('Origin', '*');

const datastore = new Datastore({
    projectId: projectId,
});
//カウント変数の初期化
let count = 0;
let savedValue = count;
let isDbreaded = false;

function handler(req, res) {
    res.writeHead(200);
    return res.end(`{count:${count}}`);
}

//dbから読み込み
function getCount() {
    const query = datastore.createQuery('CountData');
    return datastore.runQuery(query).then((results) => {
        console.log("DBデーター:" + results[0][0].description);
        count = results[0][0].description;
        isDbreaded = true;
    });
}
getCount();
//socket イベント
io.on('connection', socket => {
    //uoidを初回送信
    let uoid = uuidv4();
    console.log(count);
    io.to(socket.id).emit('takamari', count);
    io.to(socket.id).emit('uoid', uoid);
    
    setInterval(new_uo, 30000);
    //uo受け取りイベント
    socket.on('burn', data => {
        console.log(data.uoid + "," + uoid);
        if (data.uoid === "") return;
        else if ((data.uoid === uoid)&&isDbreaded) {
            count++;
            //ブロードキャストし情報を送信
            io.emit('takamari', count);
            //30秒後に新しいUOIDを送信
            console.log(count);
            uoid = "";
        }
    });
    function new_uo() {
        uoid = uuidv4();
        io.to(socket.id).emit('uoid', uoid);
    }
});
//10秒ごとにDBを更新
setInterval(db_update, 60000);
function db_update() {
    if (isDbreaded&&(count!==savedValue)) {
        // The kind for the new entity
        const kind = 'CountData';
        // The name/ID for the new entity
        const name = 'value';
        // The Cloud Datastore key for the new entity
        const taskKey = datastore.key([kind, name]);

        // Prepares the new entity
        const task = {
            key: taskKey,
            data: {
                description: count,
            },
        };

        // Saves the entity
        datastore
            .save(task)
            .then(() => {
                console.log(`Saved ${task.key.name}: ${task.data.description}`);
                savedValue = count;
            })
            .catch(err => {
                console.error('ERROR:', err);
            });
    }
}
