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
        sound_list[i].addEventListener('canplaythrough', onSoundLoaded, false);
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

    if( navigator.userAgent.indexOf('iPhone') > 0
        || navigator.userAgent.indexOf('iPod') > 0
        || navigator.userAgent.indexOf('iPad') > 0
        || navigator.userAgent.indexOf('Android') > 0
        || navigator.userAgent.indexOf('Windows Phone') > 0 ) {
        touchdev = true;
    }
    scalerate = 1;
    if( touchdev ){
        scalerate = Math.min(window.innerWidth/view.w, window.innerHeight/view.h);
    }

    canvas = document.getElementById('canvas');
    canvas.width = view.w;
    canvas.height = view.h;
    canvas.style.width = view.w*scalerate+'px';
    canvas.style.height = view.h*scalerate+'px';
    ctx = canvas.getContext('2d');

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
    init_sound();
    frame_loop();
}

function start_game(){
    console.log("開始遊戲！");
    init_game();
}

function frame_loop() {
    tickcount++;
    if( timer_func != null ) timer_func();
    if( draw_request ) draw_game();
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

// 滑鼠座標處理
function adjustXY(e) {
    var rect = e.target.getBoundingClientRect();
    if( scalerate>0 ){
        mouse.x = (e.clientX-rect.left)/scalerate;
        mouse.y = (e.clientY-rect.top)/scalerate;
    }
}

// 觸控座標處理
function touchXY(e) {
    var rect = e.target.getBoundingClientRect();
    mouse.x = e.touches[0].pageX - rect.left;
    mouse.y = e.touches[0].pageY - rect.top;
    if( scalerate>0 ){
        mouse.x /= scalerate;
        mouse.y /= scalerate;
    }
}

// 畫布清除
function cls() {
    ctx.beginPath();
    ctx.fillStyle = "#000000";
    ctx.fillRect(0,0,view.w,view.h);
}

// 基本畫圖函數
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
    ctx.strokeStyle= col;
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

function draw_fade(x,y,w,h,col,a) {
    if ( a < 0 ) a = 0;
    if ( a > 100 ) a = 100;
    ctx.globalAlpha = a / 100;
    ctx.fillStyle = col;
    ctx.fillRect(x,y,w,h);
    ctx.globalAlpha = 1.0;
}

// 遊戲用變數
var draw_request = false;
var counter = 0;

var all_colors = [
    "#0000ff","#68e2f8","#ffff00","#107708","#16fa05","#c74cfb",
    "#ff0084","#fe91b9","#ff7800","#771339","#f54242","#42f554",
    "#ffa500","#ff1493","#00ced1","#ff4500","#8a2be2","#7fff00"
];
var cols = [];
var selected = 0;
var linewidth = 4;
var resetbutton = {x:50, y:50, r:20, col:"#ffffff", visible:true};
var face = {x:570, y:400, r:36, pat:0};
var mes = {exist:true,txt1:"",txt2:""};
var timer = {st:0, ed:0};

// 棋盤格子
var xmax = 3;
var ymax = 3;
var cel = new Array();
var cel_w = 320 / 3;
var cel_h = 320 / 3;
var xadd = [1,0,-1,0];
var yadd = [0,1,0,-1];

var buttons = [
    {x: 30, y: 100, w: 80, h: 40, label: "3x3", grid: 3, active: true},
    {x: 30, y: 150, w: 80, h: 40, label: "4x4", grid: 4, active: false},
    {x: 30, y: 200, w: 80, h: 40, label: "5x5", grid: 5, active: false},
];

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
    update_colors();  // 每次開始關卡重新挑選顏色

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

// 第一次點擊
function first_click() {
    bgm.play();
    if (click_reset()) {
        start_stage();
        return;
    }
    if (click_button()) {
        return;
    }
    var n = get_cn();
    if (n < 0) return;

    se_click.play();

    selected = n;
    for (var i = 0; i < ymax; i++) {
        for (var j = 0; j < xmax; j++) {
            cel[i][j].prio = (i * xmax + j == n);
        }
    }
    timer_func = draw_selected;
    click_func = second_click;
}

// 更新目前顏色
function update_colors(){
    var color_count = 10 + (xmax - 3) * 3;  // 3x3 → 10色, 4x4 → 13色, 5x5 → 16色
    if (color_count > all_colors.length) color_count = all_colors.length;

    cols = [];
    let shuffled = all_colors.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    for (let i = 0; i < color_count; i++) {
        cols.push(shuffled[i]);
    }

    console.log("目前顏色數量：" + cols.length);
}

// 判斷是否按到網格按鈕
function click_button(){
    for (var i = 0; i < buttons.length; i++) {
        var btn = buttons[i];
        if (mouse.x >= btn.x && mouse.x <= btn.x + btn.w &&
            mouse.y >= btn.y && mouse.y <= btn.y + btn.h) {

            if (btn.active) {
                // 已經是目前模式，不能點
                return true;
            }

            // 切換模式
            se_button.play();
            setGrid(btn.grid);
            for (var j = 0; j < buttons.length; j++) {
                buttons[j].active = false;
            }
            btn.active = true;
            return true;
        }
    }
    return false;
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

// 設定棋盤格數
function setGrid(n){
    xmax = n;
    ymax = n;
    cel_w = 320 / n;
    cel_h = 320 / n;
    init_game();
}

// 主畫面繪製
function draw_game(){
    var i,j;

    // 如果 loading 還沒完成，顯示 loading 畫面
    if( !loading_done ){
        cls();
        draw_text(view.w/2 - 80, view.h/2 - 20, "Loading... " + Math.floor((sound_loaded/sound_total)*100) + "%", 28, "#ffffff");
        return;
    }

    cls();

    ctx.lineWidth = linewidth;
    ctx.beginPath();
    ctx.fillStyle = "#0088ff";
    ctx.fillRect(cel[0][0].ox,cel[0][0].oy,cel_w*xmax,cel_h*ymax);

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
    for (var i = 0; i < buttons.length; i++) {
        var btn = buttons[i];
        // 如果當前 active，畫不同顏色
        var isActive = (btn.grid == xmax);
        var bgCol = isActive ? "#ffcc00" : "#ffffff";  // active 黃色
        var textCol = isActive ? "#000000" : "#000000";

        draw_round_rect(btn.x, btn.y, btn.w, btn.h, 8, bgCol);

        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(btn.x + 8, btn.y);
        ctx.arcTo(btn.x + btn.w, btn.y, btn.x + btn.w, btn.y + btn.h, 8);
        ctx.arcTo(btn.x + btn.w, btn.y + btn.h, btn.x, btn.y + btn.h, 8);
        ctx.arcTo(btn.x, btn.y + btn.h, btn.x, btn.y, 8);
        ctx.arcTo(btn.x, btn.y, btn.x + btn.w, btn.y, 8);
        ctx.closePath();
        ctx.stroke();

        ctx.fillStyle = textCol;
        ctx.font = "20px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(btn.label, btn.x + btn.w / 2, btn.y + btn.h / 2);
    }

    // 畫出貓貓臉
    var x = face.x;
    var y = face.y;
    var size = face.r * 2;
    var r = 20;

    ctx.lineWidth = 3;
    ctx.strokeStyle = resetbutton.col;
    ctx.fillStyle = resetbutton.col;

    // 圓角方臉
    draw_round_rect(x - size/2, y - size/2, size, size, r, resetbutton.col);
    ctx.stroke();

    // 左耳
    ctx.beginPath();
    ctx.moveTo(x - size/2 + 5, y - size/2 + 15);
    ctx.lineTo(x - size/2 + 25, y - size/2 - 15);
    ctx.lineTo(x - size/2 + 45, y - size/2 + 15);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 右耳
    ctx.beginPath();
    ctx.moveTo(x + size/2 - 5, y - size/2 + 15);
    ctx.lineTo(x + size/2 - 25, y - size/2 - 15);
    ctx.lineTo(x + size/2 - 45, y - size/2 + 15);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 眼睛
    draw_circle(x - 13, y - 5, 5, "#000000");
    draw_circle(x + 13, y - 5, 5, "#000000");

    // ω 嘴
    if( face.pat == 0 ){
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(x - 4, y + 10, 4, Math.PI * 0.1, Math.PI * 0.9, false);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x + 4, y + 10, 4, Math.PI * 0.1, Math.PI * 0.9, false);
        ctx.stroke();
    }else if( face.pat == 1 ){
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(x - 6, y + 8);
        ctx.lineTo(x + 6, y + 8);
        ctx.stroke();
    }else if( face.pat == 2 ){
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 4; 
        ctx.beginPath();
        ctx.arc(x, y + 10, 6, 0, Math.PI, false);
        ctx.stroke();
    }

    // 畫出訊息氣泡
    if (mes.exist) {
        var bubble_w = 130;
        var bubble_h = 80;
        var bubble_r = 16;
        var bubble_x = face.x - bubble_w / 2;
        var bubble_y = face.y - face.r - bubble_h - 30;

        fukidasi(bubble_x, bubble_y, bubble_w, bubble_h, bubble_r, "#ffffff");
        draw_text(bubble_x + bubble_r, bubble_y + bubble_r, mes.txt1, 20, "#000000");
        draw_text(bubble_x + bubble_r, bubble_y + bubble_r + 32, mes.txt2, 20, "#000000");
    }
}

// 畫出單一格子
function draw_cel(cx,cy){
    var w = cel_w/2;
    var h = cel_h/2;
    var x = cel[cy][cx].x+w;
    var y = cel[cy][cx].y+h;
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

// 畫出氣泡訊息框
function fukidasi(x, y, w, h, r, col) {
    var ss = 10;
    var tt = 10;
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(x, y + r);
    ctx.arc(x + r, y + h - r, r, Math.PI, Math.PI / 2, true);
    ctx.lineTo(x+w*2/4-ss, y+h);
    ctx.lineTo(x+w*2/4, y+h+tt);
    ctx.lineTo(x+w*2/4+ss, y+h);
    ctx.arc(x+w-r, y+h-r, r, Math.PI/2, 0, true);
    ctx.arc(x + w - r, y + r, r, 0, Math.PI * 3 / 2, true);
    ctx.arc(x+r, y+r, r, Math.PI*3/2, Math.PI, true);
    ctx.closePath();
    ctx.fill();
}
