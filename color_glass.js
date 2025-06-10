var canvas;
var context;
var scalerate = 1;
var FPS = 30;
var touchdev = false;
var view = { w:640, h:480 };
var mouse = { x:0, y:0, ox:0, oy:0 };
var tickcount = 0;

// 音效與背景音樂
var bgm = new Audio("sounds/bgm.mp3");
var se_click = new Audio("sounds/click.mp3");
var se_swap = new Audio("sounds/swap.mp3");
var se_clear = new Audio("sounds/clear.mp3");
var se_button = new Audio("sounds/button.mp3");

// 要載入的音效列表
var sound_list = [bgm, se_click, se_swap, se_clear, se_button];
var sound_loaded = 0;
var sound_total = sound_list.length;
var loading_done = false;

// 音效初始化
function init_sound(){
    bgm.loop = true;
    bgm.volume = 0.5;
    bgm.preload = "auto";
    se_click.volume = 0.6;
    se_click.preload = "auto";
    se_swap.volume = 0.6;
    se_swap.preload = "auto";
    se_clear.volume = 0.7;
    se_clear.preload = "auto";
    se_button.volume = 0.6;
    se_button.preload = "auto";

    for( var i=0; i<sound_list.length; i++ ){
        sound_list[i].addEventListener('canplaythrough', onSoundLoaded, { once: true });
        sound_list[i].load();
    }
}

function onSoundLoaded(){
    sound_loaded++;
    console.log("音效載入中：" + sound_loaded + "/" + sound_total);
    if( sound_loaded >= sound_total && !loading_done ){
        loading_done = true;
        console.log("所有音效載入完成！");
        start_game();
    }
}

window.onload = function(){
    var i;

    // 取得 HTML 元素
    var nameOverlay = document.getElementById('name-input-overlay');
    var nameInput = document.getElementById('player-name-input');
    var startButton = document.getElementById('start-game-button');

    canvas = document.getElementById('canvas');
    canvas.width = view.w;
    canvas.height = view.h;
    ctx = canvas.getContext('2d');
    
    // 載入排行榜資料
    load_leaderboard();

    // 監聽開始按鈕點擊事件
    startButton.onclick = function() {
        playerName = nameInput.value.trim();
        if (playerName === "") {
            playerName = "Guest"; // 如果沒輸入，給個預設名字
        }
        
        // 隱藏暱稱輸入畫面
        nameOverlay.style.display = 'none';

        // --- 以下是原本 onload 的內容 ---
        if( navigator.userAgent.indexOf('iPhone') > 0
            || navigator.userAgent.indexOf('iPod') > 0
            || navigator.userAgent.indexOf('iPad') > 0
            || navigator.userAgent.indexOf('Android') > 0
            || navigator.userAgent.indexOf('Windows Phone') > 0 ) {
            touchdev = true;
        }

        resize_canvas(); // 呼叫一次，設定初始大小

        if( touchdev ){
            canvas.ontouchstart = touchStartListner;
            canvas.ontouchmove = touchMoveListner;
            canvas.ontouchend = touchEndListner;
        }else{
            canvas.onmousedown = mouseDownListner;
            canvas.onmousemove = mouseMoveListner;
            canvas.onmouseup = mouseUpListner;
        }

        init_event_func();
        init_sound(); // 音效現在才初始化
        frame_loop();
    };
}

window.onresize = resize_canvas;

function resize_canvas(){
    touchdev = ('ontouchstart' in window) || window.matchMedia("(pointer: coarse)").matches;
    var marginRatio = touchdev ? 0.05 : 0.2;
    var marginW = window.innerWidth * marginRatio;
    var marginH = window.innerHeight * marginRatio;
    var availableWidth = window.innerWidth - marginW * 2;
    var availableHeight = window.innerHeight - marginH * 2;
    scalerate = Math.min(availableWidth / view.w, availableHeight / view.h);
    canvas.style.position = 'absolute';
    canvas.style.left = ((window.innerWidth - view.w * scalerate) / 2) + 'px';
    canvas.style.top = ((window.innerHeight - view.h * scalerate) / 2) + 'px';
    canvas.style.width = view.w * scalerate + 'px';
    canvas.style.height = view.h * scalerate + 'px';
}

function start_game(){
    console.log("開始遊戲！");
    init_game();
}

function frame_loop() {
    tickcount++;
    if( timer_func != null ) timer_func();
    if (draw_request || timer.st > 0 && timer.ed === 0) {
        draw_game();
    }
    draw_request = false;
    requestAnimationFrame(frame_loop);
}

// 事件用的函數
var timer_func = new Function();
var next_func = new Function();
var click_func = new Function();
var move_func = new Function();
var release_func = new Function();

function init_event_func(){
    timer_func = null;
    next_func = null;
    click_func = null;
    move_func = null;
    release_func = null;
}

function trace(a){ console.log(a) }

function mouseDownListner(e) {
    if( click_func != null ){ adjustXY(e); click_func(); }
}
function mouseMoveListner(e) {
    if( move_func != null ){ adjustXY(e); move_func(); }
}
function mouseUpListner(e) {
    if( release_func != null ){ adjustXY(e); release_func(); }
}
function touchStartListner(e) {
    if( click_func != null ){ touchXY(e); click_func(); }
    e.preventDefault();
}
function touchMoveListner(e) {
    if( move_func != null ){ touchXY(e); move_func(); }
    e.preventDefault();
}
function touchEndListner(e) {
    if( release_func != null ){ release_func(); }
    e.preventDefault();
}

function adjustXY(e) {
    var rect = e.target.getBoundingClientRect();
    if( scalerate > 0 ){
        mouse.x = (e.clientX - rect.left) / scalerate;
        mouse.y = (e.clientY - rect.top) / scalerate;
    }
}

function touchXY(e) {
    var rect = e.target.getBoundingClientRect();
    mouse.x = e.touches[0].pageX - rect.left;
    mouse.y = e.touches[0].pageY - rect.top;
    if( scalerate > 0 ){
        mouse.x /= scalerate;
        mouse.y /= scalerate;
    }
}

function cls() {
    ctx.beginPath();
    ctx.fillStyle = "#000000";
    ctx.fillRect(0,0,view.w,view.h);
}

function triangle(x1,y1,x2,y2,x3,y3,col,alpha) {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(x1,y1);
    ctx.lineTo(x2,y2);
    ctx.lineTo(x3,y3);
    ctx.fill();
    ctx.globalAlpha = 1;
}

function draw_rect(x,y,w,h,col) {
    ctx.fillStyle = col;
    ctx.fillRect(x,y,w,h);
}

function draw_line(x1,y1,x2,y2,col){
    ctx.strokeStyle = col;
    ctx.beginPath();
    ctx.moveTo(x1,y1);
    ctx.lineTo(x2,y2);
    ctx.stroke();
}

function draw_round_rect(x, y, w, h, r, col){
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    ctx.fill();
}

function draw_circle(x,y,r, col) {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(x,y, r, 0, Math.PI*2, true);
    ctx.fill();
}

function draw_text(x, y, str, size, col) {
    ctx.fillStyle = col;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.font = size + "px sans-serif";
    ctx.fillText(str,x,y);
}

// 遊戲用變數
var draw_request = false;
var counter = 0;
var cols = [
    "#bbbbaa","#e62829","#2980ef","#fac000","#3fa129",
    "#3fd8ff","#ff8000","#9141cb","#ef4179","#91a119",
    "#afa981","#915121","#50413f","#ef70ef","#ac379e",
    "#7766ee","#aaaabb","#6666bb","#ffffff","#025ca6"
];
var selected = 0;
var linewidth = 4;
var resetbutton = {x:50, y:50, r:20, col:"#ffffff", visible:true};
var face = {x:555, y:400, r:36, pat:0};
var mes = {exist:true,txt1:"",txt2:""};
var timer = {st:0, ed:0};
var color_count = 10;
var blink_counter = 0;
var blink_timer = 0;
var blink_interval = 180;
var timer_alpha = 1;    
var timer_fade_step = 0.05; 
var timer_display = 0; 

// 玩家與排行榜變數
var playerName = "";
var leaderboards = {}; // 所有排行榜資料的容器
var show_leaderboard = false; // 是否顯示排行榜
var leaderboardbutton = { x: 50, y: view.h - 100, r: 20, label: "🏆", visible: true }; // 排行榜按鈕

// 棋盤格子
var xmax = 3;
var ymax = 3;
var cel = new Array();
var cel_w = 320 / 3;
var cel_h = 320 / 3;
var xadd = [1,0,-1,0];
var yadd = [0,1,0,-1];

// 按鈕區 (有 active 標記)
var buttons = [
    {x: 30, y: 100, w: 80, h: 40, label: "3x3", grid: 3, active: true},
    {x: 30, y: 150, w: 80, h: 40, label: "4x4", grid: 4, active: false},
    {x: 30, y: 200, w: 80, h: 40, label: "5x5", grid: 5, active: false},
    {x: 30, y: 250, w: 80, h: 40, label: "6x6", grid: 6, active: false},
];
var rulebutton = { x: 50, y: view.h - 50, r: 20, label: "i", visible: true };
var show_rules = false;

// 遊戲初始化
function init_game() {
    var i,j;
    var ox = (view.w-cel_w*xmax)/2;
    var oy = (view.h-cel_h*ymax)/2;
    for( i=0; i<ymax; i++ ){
        cel[i] = new Array();
        for( j=0; j<xmax; j++ ){
            cel[i][j] = new Object();
            cel[i][j].ox =  ox + cel_w*j;
            cel[i][j].oy =  oy + cel_h*i;
            cel[i][j].x =  ox + cel_w*j;
            cel[i][j].y =  oy + cel_h*i;
            cel[i][j].col = [0,0,0,0];
            cel[i][j].old = [0,0,0,0];
        }
    }
    start_stage();
}

// 開始新關卡
function start_stage(){
    update_colors();
    var i,j,k;
    for( i=0; i<ymax; i++ ){
        for( j=0; j<xmax; j++ ){
            for( k=0; k<4; k++ ){
                cel[i][j].col[k] = Math.floor(Math.random() * cols.length);
            }
        }
    }
    for( i=1; i<ymax; i++ ){
        for( j=0; j<xmax; j++ ){
            cel[i][j].col[3] = cel[i-1][j].col[1];
        }
    }
    for( i=0; i<ymax; i++ ){
        for( j=1; j<xmax; j++ ){
            cel[i][j].col[2] = cel[i][j-1].col[0];
        }
    }
    for( i=0; i<ymax; i++ ){
        for( j=0; j<xmax; j++ ){
            var cx = Math.floor(Math.random()*xmax);
            var cy = Math.floor(Math.random()*ymax);
            for( k=0; k<4; k++ ){
                var tmp = cel[i][j].col[k];
                cel[i][j].col[k] = cel[cy][cx].col[k];
                cel[cy][cx].col[k] = tmp;
            }
        }
    }
    linewidth = 4;
    face.pat = 0;
    mes.exist = false;
    timer.st = new Date().getTime();
    start_wait();
    timer.st = 0;
    timer.ed = 0;
    timer_alpha = 1;
    timer_display = 0;
}

// 取得目前滑鼠在哪個格子
function get_cn(){
    var i,j;
    var mx = mouse.x;
    var my = mouse.y;
    var n = -1;
    for( i = 0; i < ymax; i++ ){
        for( j = 0; j < xmax; j++ ){
            if( mx < cel[i][j].x || mx >= cel[i][j].x + cel_w ) continue;
            if( my < cel[i][j].y || my >= cel[i][j].y + cel_h ) continue;
            n = i * xmax + j;
        }
    }
    return n;
}

// 等待玩家點擊
function start_wait(){
    for( var i=0; i<ymax; i++ ){
        for( var j=0; j<xmax; j++ ){
            cel[i][j].x = cel[i][j].ox;
            cel[i][j].y = cel[i][j].oy;
            cel[i][j].prio = false;
            for( var k=0; k<4; k++ ){
                cel[i][j].old[k] = cel[i][j].col[k];
            }
        }
    }
    draw_request = true;
    init_event_func();
    click_func = first_click;
}

// 判斷是否按到重設按鈕
function click_reset(){
    var mx = mouse.x;
    var my = mouse.y;
    var x = resetbutton.x;
    var y = resetbutton.y;
    var r = resetbutton.r+4;
    if( mx<x-r || mx>x+r ) return false;
    if( my<y-r || my>y+r ) return false;
    se_button.play();
    return true;
}

// 判斷是否按到網格按鈕
function click_button(){
    for (var i = 0; i < buttons.length; i++) {
        var btn = buttons[i];
        if (mouse.x >= btn.x && mouse.x <= btn.x + btn.w &&
            mouse.y >= btn.y && mouse.y <= btn.y + btn.h) {
            if (btn.grid == activeButton) {
                return false;
            }
            se_button.play();
            setGrid(btn.grid);
            return true;
        }
    }
    return false;
}

// 玩家第一次點擊
function first_click(){
    bgm.play();
    if( click_reset() ){
        start_stage();
        return;
    }
    if (click_button()) {
        return;
    }
    if (click_rulebutton()) {
        return;
    }
    if (click_leaderboardbutton()) {
        return;
    }

    var n = get_cn();
    if( n < 0 ) return;

    // 確認是否點到拼圖格子範圍內（避免邊角誤判）
    var cx = Math.floor(n % xmax);
    var cy = Math.floor(n / xmax);
    if (!cel[cy] || !cel[cy][cx]) return;
    se_click.play();
    selected = n;
    for( var i = 0; i < ymax; i++ ){
        for( var j = 0; j < xmax; j++ ){
            cel[i][j].prio = (i * xmax + j == n);
        }
    }
    timer_func = draw_selected;
    click_func = second_click;
}

// 點擊選中的動畫
function draw_selected(){
    if (timer.st === 0) {
        timer.st = new Date().getTime();
    }
    var cx = Math.floor(selected%xmax);
    var cy = Math.floor(selected/xmax);
    counter++;
    cel[cy][cx].y = cel[cy][cx].oy - 14*Math.sin(Math.PI*counter/24);
    draw_request = true;
}

// 第二次點擊 → 交換格子
function second_click(){
    if( click_reset() ){
        start_stage();
        return;
    }
    if ( click_rulebutton() ) {
        return;
    }
    if (click_leaderboardbutton()) {
        return;
    }
    var n = get_cn();
    if( n<0 ) return;
    if( n==selected ){
        start_wait();
        return;
    }
    var cx1 = Math.floor(selected%xmax);
    var cy1 = Math.floor(selected/xmax);
    var cx2 = Math.floor(n%xmax);
    var cy2 = Math.floor(n/ymax);
    cel[cy1][cx1].dx = cx2;
    cel[cy1][cx1].dy = cy2;
    cel[cy2][cx2].dx = cx1;
    cel[cy2][cx2].dy = cy1;
    cel[cy1][cx1].prio = true;
    cel[cy2][cx2].prio = true;
    cel[cy1][cx1].x = cel[cy1][cx1].ox-8;
    cel[cy2][cx2].x = cel[cy2][cx2].ox-12;
    cel[cy1][cx1].y = cel[cy1][cx1].oy-8;
    cel[cy2][cx2].y = cel[cy2][cx2].oy-12;
    counter=0;
    init_event_func();
    timer_func = move_cel;
}

// 點擊規則按鈕
function click_rulebutton(){
    var mx = mouse.x;
    var my = mouse.y;
    var dx = mx - rulebutton.x;
    var dy = my - rulebutton.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist <= rulebutton.r + 2) {
        se_button.play();
        show_rules = !show_rules;
        draw_request = true;
        return true;
    }
    return false;
}

// 載入排行榜資料 (從 Firestore )
function load_leaderboard() {
    const difficultyList = ["3", "4", "5", "6"];
    leaderboards = {}; // 重新清空，避免重複資料
    let promises = difficultyList.map(grid => {
        return db.collection("leaderboards")
            .where("grid", "==", grid)
            .orderBy("time")
            .limit(5)
            .get()
            .then((querySnapshot) => {
                const records = [];
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    if (data.name && data.time !== undefined) {
                        records.push({ name: data.name, time: data.time });
                    }
                });
                leaderboards[grid] = records;
                console.log(`載入 ${grid}x${grid} 成績`, records);
            })
            .catch((error) => {
                console.error(`讀取 ${grid}x${grid} 排行榜錯誤：`, error);
            });
    });

    Promise.all(promises).then(() => {
        draw_request = true;
        console.log("所有排行榜資料載入完成");
    });
}

// 儲存排行榜資料 (到 localStorage)
function save_leaderboard() {
    localStorage.setItem('colorPuzzleLeaderboards', JSON.stringify(leaderboards));
}

// 點擊排行榜按鈕
function click_leaderboardbutton() {
    var mx = mouse.x;
    var my = mouse.y;
    var dx = mx - leaderboardbutton.x;
    var dy = my - leaderboardbutton.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist <= leaderboardbutton.r + 2) {
        se_button.play();
        show_leaderboard = !show_leaderboard;
        if (show_leaderboard) load_leaderboard();
        draw_request = true;
        return true;
    }
    return false;
}

// 執行交換動畫
function move_cel(){
    var i,j,k;
    for( i=0; i<ymax; i++ ){
        for( j=0; j<xmax; j++ ){
            if( !cel[i][j].prio ) continue;
            var dx = cel[i][j].dx;
            var dy = cel[i][j].dy;
            cel[i][j].x += (cel[dy][dx].ox-cel[i][j].x)/4;
            cel[i][j].y += (cel[dy][dx].oy-cel[i][j].y)/4;
        }
    }
    counter++;
    if(counter<6){
        draw_request = true;
        return;
    }
    se_swap.play();
    for( i=0; i<ymax; i++ ){
        for( j=0; j<xmax; j++ ){
            cel[i][j].x = cel[i][j].ox;
            cel[i][j].y = cel[i][j].oy;
            if( !cel[i][j].prio ) continue;
            var dx = cel[i][j].dx;
            var dy = cel[i][j].dy;
            for( k=0; k<4; k++ ){
                cel[dy][dx].col[k] = cel[i][j].old[k];
            }
        }
    }
    if( check_clear() ){
        draw_request = true;
        timer_func = clear_anime;
        counter=0;
        timer.ed = new Date().getTime();
    }else{
        start_wait();
    }
}

// 檢查是否過關
function check_clear(){
    var i,j;
    var f=0;
    for( i=1; i<ymax; i++ ){
        for( j=0; j<xmax; j++ ){
            if( cel[i][j].col[3] != cel[i-1][j].col[1] ) f=1;
        }
    }
    if( f>0 ) return false;
    for( i=0; i<ymax; i++ ){
        for( j=1; j<xmax; j++ ){
            if( cel[i][j].col[2] != cel[i][j-1].col[0] ) f=1;
        }
    }
    if( f>0 ) return false;
    return true;
}

// 過關動畫
function clear_anime(){
    if( counter === 0 ){
        se_clear.play();
    }

    linewidth -= 0.5;
    if( linewidth < 0 ) face.pat = 1;
    draw_request = true;
    counter++;

    if( counter < 16 ) return;

    face.pat = 1;
    counter = 0;
    timer_func = talk;
    mes.exist = true;

    var t = Math.floor((timer.ed - timer.st) / 1000);
    mes.txt2 = t + " 秒";

    var lev = 0, limit1 = 0, limit2 = 0, limit3 = 0, limit4 = 0;

    if( activeButton == 3 ){
        limit1 = 60; limit2 = 40; limit3 = 30; limit4 = 20;
    } else if( activeButton == 4 ){
        limit1 = 360; limit2 = 180; limit3 = 120; limit4 = 90;
    } else if( activeButton == 5 ){
        limit1 = 720; limit2 = 480; limit3 = 360; limit4 = 240;
    } else if( activeButton == 6 ){
        limit1 = 1440; limit2 = 840; limit3 = 500; limit4 = 360;
    }

    if( t < limit4 ) lev = 4;
    else if( t < limit3 ) lev = 3;
    else if( t < limit2 ) lev = 2;
    else if( t < limit1 ) lev = 1;
    else lev = 0;

    var come = ["不錯喔！", "很好耶！", "超棒der！", "太強啦！", "無敵了！"];
    mes.txt1 = come[lev];

    // 新增成績到 Firestore（包含 grid 欄位）
    var currentGrid = String(activeButton);
    var newRecord = {
        name: playerName,
        time: t,
        grid: currentGrid
    };

    db.collection("leaderboards").add(newRecord)
        .then(() => {
            console.log("新成績已儲存");
            load_leaderboard(); // 寫入後馬上重新載入排行榜資料
        })
        .catch((error) => {
            console.error("成績寫入失敗：", error);
        });
}

// 表情臉說話動畫
function talk(){
    counter++;
    face.pat = Math.floor(counter/10)%2;
    if( counter>60 ){
        face.pat = 0;
    }
    draw_request = true;
    if( counter>120 ){
        face.pat = 2;
        init_event_func();
        click_func = start_stage;
    }
}

var activeButton = 3;
function setGrid(n){
    xmax = n;
    ymax = n;
    cel_w = 320 / n;
    cel_h = 320 / n;
    if (n == 3) color_count = 10;
    else if (n == 4) color_count = 13;
    else if (n == 5) color_count = 16;
    else if (n == 6) color_count = 19;
    activeButton = n;
    update_colors();
    init_game();
}

// 主畫面繪製
function draw_game(){
    var i,j;
    if( !loading_done ){
        cls();
        draw_text(view.w/2 - 80, view.h/2 - 20, "Loading... " + Math.floor((sound_loaded/sound_total)*100) + "%", 28, "#ffffff");
        return;
    }

    cls();

    // 畫出計時器
    var elapsedSeconds;
    if (mes.exist) {
        elapsedSeconds = Math.floor((timer.ed - timer.st) / 1000);
    } else if (timer.st > 0) { 
        elapsedSeconds = Math.floor((new Date().getTime() - timer.st) / 1000);
    } else {
        elapsedSeconds = 0;
    }

    // 平滑更新顯示用時間（只在時間變更時）
    if (timer.st > 0 || mes.exist) {
        timer_display = elapsedSeconds;
    timer_alpha = 1;  // 一旦開始遊戲就恢復為完全不透明
    } else {
        if (timer_alpha > 0) {
            timer_alpha -= timer_fade_step;
            if (timer_alpha < 0) timer_alpha = 0;
        }
    }

    // 繪製秒數（對齊貓貓中心）
    var timerX = face.x;
    var timerY = 40;

    ctx.globalAlpha = timer_alpha;
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.font = "32px sans-serif";
    ctx.fillText(Math.floor(timer_display), timerX, timerY);
    ctx.globalAlpha = 1;  // 還原透明度

    ctx.lineWidth = linewidth;
    ctx.beginPath();
    var grid_w = cel_w*xmax;
    var grid_h = cel_h*ymax;
    var grid_ox = (view.w - grid_w)/2;
    var grid_oy = (view.h - grid_h)/2;
    ctx.fillStyle = "#0088ff";
    ctx.fillRect(grid_ox, grid_oy, grid_w, grid_h);

    ctx.strokeStyle = "#000000";
    for( i=0; i<ymax; i++ ){
        for( j=0; j<xmax; j++ ){
            if( !cel[i][j].prio ) draw_cel(j,i);
        }
    }
    for( i=0; i<ymax; i++ ){
        for( j=0; j<xmax; j++ ){
            if( cel[i][j].prio ) draw_cel(j,i);
        }
    }

    // 畫出重設按鈕
    if( resetbutton.visible ){
        ctx.lineWidth = 3;
        ctx.strokeStyle = resetbutton.col;
        ctx.fillStyle = resetbutton.col;
        ctx.beginPath();
        var x = resetbutton.x;
        var y = resetbutton.y;
        var r = resetbutton.r;
        ctx.arc( x, y, r, 0, Math.PI*20/180, true );
        ctx.stroke();
        ctx.beginPath();
        x += r/8;
        ctx.moveTo(x+r-r*2/3,y-r/3);
        ctx.lineTo(x+r,y);
        ctx.lineTo(x+r,y-r*3/4);
        ctx.fill();
        ctx.stroke();
    }

    // 畫出切換按鈕
    for (i = 0; i < buttons.length; i++) {
        var btn = buttons[i];
        var bgColor = (btn.grid == activeButton) ? "#ffff99" : "#ffffff";
        draw_round_rect(btn.x, btn.y, btn.w, btn.h, 8, bgColor);
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2;
        ctx.stroke(new Path2D(`M${btn.x+8},${btn.y} h${btn.w-16} a8,8,0,0,1,8,8 v${btn.h-16} a8,8,0,0,1,-8,8 h-${btn.w-16} a8,8,0,0,1,-8,-8 v-${btn.h-16} a8,8,0,0,1,8,-8 Z`));

        ctx.fillStyle = "#000000";
        ctx.font = "20px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(btn.label, btn.x + btn.w / 2, btn.y + btn.h / 2);
    }

    // 畫貓貓臉
    var x = face.x, y = face.y, size = face.r * 2, r = 20;
    ctx.lineWidth = 3;
    ctx.strokeStyle = resetbutton.col;
    ctx.fillStyle = resetbutton.col;
    draw_round_rect(x - size/2, y - size/2, size, size, r, resetbutton.col);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - size/2 + 5, y - size/2 + 15);
    ctx.lineTo(x - size/2 + 25, y - size/2 - 15);
    ctx.lineTo(x - size/2 + 45, y - size/2 + 15);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + size/2 - 5, y - size/2 + 15);
    ctx.lineTo(x + size/2 - 25, y - size/2 - 15);
    ctx.lineTo(x + size/2 - 45, y - size/2 + 15);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    blink_timer++;
    if (blink_timer > blink_interval) {
        blink_counter++;
        if (blink_counter > 6) { 
            blink_counter = 0;
            blink_timer = 0;
            blink_interval = 120 + Math.floor(Math.random() * 180);
        }
    }
    if (blink_counter == 0) {
        draw_circle(x - 13, y - 5, 5, "#000000");
        draw_circle(x + 13, y - 5, 5, "#000000");
    } else {
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - 18, y - 5); ctx.lineTo(x - 8, y - 5); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + 8, y - 5); ctx.lineTo(x + 18, y - 5); ctx.stroke();
    }
    ctx.strokeStyle = "#000000"; ctx.lineWidth = 2;
    if( face.pat == 0 ){
        ctx.beginPath(); ctx.arc(x - 4, y + 10, 4, Math.PI * 0.1, Math.PI * 0.9, false); ctx.stroke();
        ctx.beginPath(); ctx.arc(x + 4, y + 10, 4, Math.PI * 0.1, Math.PI * 0.9, false); ctx.stroke();
    }else if( face.pat == 1 ){
        ctx.beginPath(); ctx.moveTo(x - 6, y + 8); ctx.lineTo(x + 6, y + 8); ctx.stroke();
    }else if( face.pat == 2 ){
        ctx.beginPath(); ctx.arc(x, y + 10, 6, 0, Math.PI, false); ctx.stroke();
    }

    // 畫出訊息氣泡
    if (mes.exist) {
        var bubble_w = 130, bubble_h = 80, bubble_r = 16;
        var bubble_x = face.x - bubble_w / 2, bubble_y = face.y - face.r - bubble_h - 30;
        fukidasi(bubble_x, bubble_y, bubble_w, bubble_h, bubble_r, "#ffffff");
        draw_text(bubble_x + bubble_r, bubble_y + bubble_r, mes.txt1, 20, "#000000");
        draw_text(bubble_x + bubble_r, bubble_y + bubble_r + 32, mes.txt2, 20, "#000000");
    }

    // 畫出規則按鈕
    if (rulebutton.visible) {
        ctx.lineWidth = 3; ctx.strokeStyle = "#000000"; ctx.fillStyle = "#ffffff";
        ctx.beginPath(); ctx.arc(rulebutton.x, rulebutton.y, rulebutton.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#000000"; ctx.font = "20px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(rulebutton.label, rulebutton.x, rulebutton.y);
    }
    
    // 畫出排行榜按鈕
    if (leaderboardbutton.visible) {
        ctx.lineWidth = 3; ctx.strokeStyle = "#000000"; ctx.fillStyle = "#ffffff";
        ctx.beginPath(); ctx.arc(leaderboardbutton.x, leaderboardbutton.y, leaderboardbutton.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#000000"; ctx.font = "20px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(leaderboardbutton.label, leaderboardbutton.x, leaderboardbutton.y);
    }

    // 畫出排行榜
    if (show_leaderboard) {
        var board_x = 150, board_y = 100, board_w = 340, board_h = 280, board_r = 16;
        var currentGrid = String(activeButton);
        var title = "排行榜 (" + currentGrid + "x" + currentGrid + ")";
        var records = leaderboards[currentGrid] || [];

        draw_round_rect(board_x, board_y, board_w, board_h, board_r, "rgba(255, 255, 255, 0.95)");
        ctx.strokeStyle = "#000000"; ctx.lineWidth = 3;
        ctx.stroke(new Path2D(`M${board_x+board_r},${board_y} h${board_w-2*board_r} a${board_r},${board_r},0,0,1,${board_r},${board_r} v${board_h-2*board_r} a${board_r},${board_r},0,0,1,-${board_r},${board_r} h-${board_w-2*board_r} a${board_r},${board_r},0,0,1,-${board_r},-${board_r} v-${board_h-2*board_r} a${board_r},${board_r},0,0,1,${board_r},-${board_r} Z`));
        
        ctx.fillStyle = "#000000"; ctx.font = "22px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "top";
        ctx.fillText(title, board_x + board_w / 2, board_y + 20);
        ctx.font = "18px sans-serif";
        var lineHeight = 35;
        if (records.length === 0) {
            ctx.textAlign = "center";
            ctx.fillText("這個難度還沒有紀錄喔！", board_x + board_w / 2, board_y + 80);
        } else {
            for (i = 0; i < records.length; i++) {
                var record = records[i];
                var rank = (i + 1) + ". ";
                var name = record.name;
                var time = record.time + " 秒";
                var text_y = board_y + 70 + i * lineHeight;
                
                ctx.textAlign = "left";
                ctx.fillText(rank, board_x + 30, text_y);
                ctx.fillText(name, board_x + 60, text_y);
                ctx.textAlign = "right";
                ctx.fillText(time, board_x + board_w - 30, text_y);
            }
        }
    }
    
    // 畫出規則
    if (show_rules) {
        var rules_x = 150, rules_y = 100, rules_w = 340, rules_h = 280, rules_r = 16;
        draw_round_rect(rules_x, rules_y, rules_w, rules_h, rules_r, "#ffffff");
        ctx.strokeStyle = "#000000"; ctx.lineWidth = 3;
        ctx.stroke(new Path2D(`M${rules_x+rules_r},${rules_y} h${rules_w-2*rules_r} a${rules_r},${rules_r},0,0,1,${rules_r},${rules_r} v${rules_h-2*rules_r} a${rules_r},${rules_r},0,0,1,-${rules_r},${rules_r} h-${rules_w-2*rules_r} a${rules_r},${rules_r},0,0,1,-${rules_r},-${rules_r} v-${rules_h-2*rules_r} a${rules_r},${rules_r},0,0,1,${rules_r},-${rules_r} Z`));

        ctx.fillStyle = "#000000"; ctx.font = "18px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "top";
        var lines = [
            "遊戲規則", "", "1. 點擊一格選擇。", "2. 再點擊另一格交換。", "3. 目標是讓相鄰邊顏色相同。", "4. 成功配對完成即過關！", "", "點擊「 i 」按鈕可以關閉本說明。"
        ];
        var lineHeight = 30;
        var text_x = rules_x + rules_w / 2;
        for (i = 0; i < lines.length; i++) {
            ctx.fillText(lines[i], text_x, rules_y + 20 + i * lineHeight);
        }
    }
}

// 畫出單一格子
function draw_cel(cx,cy){
    var w = cel_w/2, h = cel_h/2;
    var x = cel[cy][cx].x+w, y = cel[cy][cx].y+h;
    var a = 0.9;
    triangle(x,y,x+w,y-h,x+w,y+h,cols[cel[cy][cx].col[0]],a);
    triangle(x,y,x+w,y+h,x-w,y+h,cols[cel[cy][cx].col[1]],a);
    triangle(x,y,x-w,y+h,x-w,y-h,cols[cel[cy][cx].col[2]],a);
    triangle(x,y,x-w,y-h,x+w,y-h,cols[cel[cy][cx].col[3]],a);

    if( linewidth>0 ){
        ctx.beginPath();
        ctx.strokeRect(x-w,y-h,cel_w,cel_h);
        draw_line(x-w,y-h,x+w,y+h,"#000000");
        draw_line(x-w,y+h,x+w,y-h,"#000000");
    }
}

function update_colors(){
    let color_pool = [
        "#bbbbaa","#e62829","#2980ef","#fac000","#3fa129",
        "#3fd8ff","#ff8000","#9141cb","#ef4179","#91a119",
        "#afa981","#915121","#50413f","#ef70ef","#ac379e",
        "#7766ee","#aaaabb","#6666bb","#ffffff","#025ca6"
    ];
    for (let i = color_pool.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [color_pool[i], color_pool[j]] = [color_pool[j], color_pool[i]];
    }
    cols = color_pool.slice(0, color_count);
}

function fukidasi(x, y, w, h, r, col) {
    var ss = 10, tt = 10;
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(x, y + r);
    ctx.arc(x + r, y + h - r, r, Math.PI, Math.PI / 2, true);
    ctx.lineTo(x + w * 2 / 4 - ss, y + h);
    ctx.lineTo(x + w * 2 / 4, y + h + tt);
    ctx.lineTo(x + w * 2 / 4 + ss, y + h);
    ctx.arc(x + w - r, y + h - r, r, Math.PI / 2, 0, true);
    ctx.arc(x + w - r, y + r, r, 0, Math.PI * 3 / 2, true);
    ctx.arc(x + r, y + r, r, Math.PI * 3 / 2, Math.PI, true);
    ctx.closePath();
    ctx.fill();
}
