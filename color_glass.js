var canvas;
var context;
var scalerate = 1;
var FPS = 30;            // 畫面更新頻率（每秒30次）
var touchdev = false;    // 是否為觸控裝置
var view = { w:640, h:480 }; // 畫布大小
var mouse = { x:0, y:0, ox:0, oy:0 }; // 滑鼠座標
var tickcount = 0;       // 計時器

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

// 遊戲用變數
var draw_request = false;
var counter = 0;
var cols = ["#0000ff","#68e2f8","#ffff00","#107708","#16fa05","#c74cfb","#ff0084","#fe91b9","#ff7800","#771339"];
var selected = 0;
var linewidth = 4;
var resetbutton = {x:50, y:50, r:20, col:"#ffffff", visible:true };    // 重設按鈕
var face = {x:570, y:400, r:36, pat:0};    // 表情臉
var mes = {exist:true,txt1:"",txt2:""};    // 顯示訊息
var timer = {st:0, ed:0}; // 計時器開始與結束時間

// 棋盤格子
var xmax = 3;
var ymax = 3;
var cel = new Array();
var cel_w = 110;
var cel_h = 110;
var xadd = [1,0,-1,0];
var yadd = [0,1,0,-1];

var canvas;
var context;
var scalerate = 1;
var FPS = 30;            // 畫面更新頻率（每秒30次）
var touchdev = false;    // 是否為觸控裝置
var view = { w:640, h:480 }; // 畫布大小
var mouse = { x:0, y:0, ox:0, oy:0 }; // 滑鼠座標
var tickcount = 0;       // 計時器

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

// 遊戲用變數
var draw_request = false;
var counter = 0;
var cols = ["#0000ff","#68e2f8","#ffff00","#107708","#16fa05","#c74cfb","#ff0084","#fe91b9","#ff7800","#771339"];
var selected = 0;
var linewidth = 4;
var resetbutton = {x:50, y:50, r:20, col:"#ffffff", visible:true };    // 重設按鈕
var face = {x:570, y:400, r:36, pat:0};    // 表情臉
var mes = {exist:true,txt1:"",txt2:""};    // 顯示訊息
var timer = {st:0, ed:0}; // 計時器開始與結束時間

// 棋盤格子
var xmax = 3;
var ymax = 3;
var cel = new Array();
var cel_w = 110;
var cel_h = 110;
var xadd = [1,0,-1,0];
var yadd = [0,1,0,-1];

// 畫布清除
function cls() {
    ctx.beginPath();
    ctx.fillStyle = "#000000";
    ctx.fillRect(0,0,view.w,view.h);
}

// 繪製基本形狀與文字的函數
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

// 遊戲初始化
function init_game() {
    var i,j;    
    var ox = (view.w-cel_w*xmax)/2;
    var oy = (view.h-cel_h*ymax)/2;
    for( i=0; i<ymax; i++ ){
        cel[i] = new Array();
        for( j=0; j<xmax; j++ ){
            cel[i][j] = new Object();
            cel[i][j].ox =  ox + cel_w*j;    // 格子初始位置
            cel[i][j].oy =  oy + cel_h*i;
            cel[i][j].x =  ox + cel_w*j;    // 畫面上位置
            cel[i][j].y =  oy + cel_h*i;
            cel[i][j].col = [0,0,0,0];    // 四個方向的顏色
            cel[i][j].old = [0,0,0,0];    // 舊顏色，用來交換
        }
    }
    start_stage();
}

// 開始新關卡
function start_stage(){
    var i,j,k;
    // 初始化顏色
    for( i=0; i<ymax; i++ ){
        for( j=0; j<xmax; j++ ){
            for( k=0; k<4; k++ ){
                cel[i][j].col[k] = Math.floor(Math.random()*10);
            }
        }
    }
    // 上下接壤
    for( i=1; i<ymax; i++ ){
        for( j=0; j<xmax; j++ ){
            cel[i][j].col[3] = cel[i-1][j].col[1];
        }
    }
    // 左右接壤
    for( i=0; i<ymax; i++ ){
        for( j=1; j<xmax; j++ ){
            cel[i][j].col[2] = cel[i][j-1].col[0];
        }
    }
    // 隨機打亂
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
    
    // 計時開始
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
                cel[i][j].old[k] = cel[i][j].col[k];    // 保存初始顏色
            }
        }
    }
    
    draw_request = true;
    init_event_func();
    click_func = first_click;
}

// 玩家第一次點擊
function first_click(){
    if( click_reset() ){
        start_stage();
        return;
    }
    var n = get_cn();
    if( n<0 ) return;
    selected = n;
    for( i=0; i<ymax; i++ ){
        for( j=0; j<xmax; j++ ){
            cel[i][j].prio = ( i*xmax+j==n );
        }
    }
    timer_func = draw_selected;
    click_func = second_click;
}

// 取得目前滑鼠在哪個格子
function get_cn(){
    var i,j;
    var mx = mouse.x;
    var my = mouse.y;
    var n=-1;
    for( i=0; i<ymax; i++ ){
        for( j=0; j<xmax; j++ ){
            if( mx<cel[i][j].x || mx>=cel[i][j].x+cel_w ) continue;
            if( my<cel[i][j].y || my>=cel[i][j].y+cel_h ) continue;
            n = i*xmax+j;
        }
    }
    return n;
}

// 點擊選中的動畫
function draw_selected(){
    var cx = Math.floor(selected%xmax);
    var cy = Math.floor(selected/xmax);
    counter++;
    cel[cy][cx].y = cel[cy][cx].oy - 14*Math.sin(Math.PI*counter/6);
    draw_request = true;
}

// 第二次點擊 → 交換格子
function second_click(){
    if( click_reset() ){
        start_stage();
        return;
    }
    var n = get_cn();
    if( n<0 ) return;
    if( n==selected ){
        start_wait();
        return;
    }
    // 設定交換目標
    var cx1 = Math.floor(selected%xmax);
    var cy1 = Math.floor(selected/xmax);
    var cx2 = Math.floor(n%xmax);
    var cy2 = Math.floor(n/xmax);
    cel[cy1][cx1].dx = cx2;
    cel[cy1][cx1].dy = cy2;
    cel[cy2][cx2].dx = cx1;
    cel[cy2][cx2].dy = cy1;
    cel[cy1][cx1].prio = true;
    cel[cy2][cx2].prio = true;
    // 初始化交換動畫位置
    cel[cy1][cx1].x = cel[cy1][cx1].ox-8;
    cel[cy2][cx2].x = cel[cy2][cx2].ox-12;
    cel[cy1][cx1].y = cel[cy1][cx1].oy-8;
    cel[cy2][cx2].y = cel[cy2][cx2].oy-12;
    
    counter=0;
    init_event_func();
    timer_func = move_cel;
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
    // 動畫完成，正式交換顏色
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
    // 檢查是否過關
    if( check_clear() ){
        draw_request = true;
        timer_func = clear_anime;
        counter=0;
        // 計時結束
        timer.ed = new Date().getTime();
    }else{
        start_wait();
    }
}

// 檢查是否過關（上下左右顏色是否對齊）
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
    linewidth -= 0.5;
    if( linewidth<0 ) face.pat=1;    
    draw_request = true;

    counter++;
    if( counter<16 ) return;
    
    face.pat = 1;
    counter = 0;
    timer_func = talk;

    mes.exist = true;
    var t = Math.floor((timer.ed-timer.st)/1000);
    mes.txt2 = t+" 秒";
    var lev = 0;
    if( t<30 ) lev = 1;
    if( t<20 ) lev = 2;
    if( t<15 ) lev = 3;
    if( t<10 ) lev = 4;
    come = ["不錯喔！","很好耶！","超棒der！","太強啦！","無敵了！"];
    
    mes.txt1 = come[lev];
}

// 表情臉說話動畫
function talk(){
    counter++;
    face.pat = Math.floor(counter/3)%2;
    if( counter>12 ){
        face.pat = 0;
    }
    draw_request = true;
    if( counter>24 ){
        face.pat = 2;
        init_event_func();
        click_func = start_stage;
    }
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
    return true;
}

// 判斷是否按到表情臉（其實這邊沒特別用）
function click_face(){
    var mx = mouse.x;
    var my = mouse.y;
    var x = face.x;
    var y = face.y;
    var r = face.r+4;
    if( mx<x-r || mx>x+r ) return false;
    if( my<y-r || my>y+r ) return false;
    return true;
}

// 主畫面繪製
function draw_game(){
    var i,j;
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
        x += r/8;    // 箭頭
        ctx.moveTo(x+r-r*2/3,y-r/3);
        ctx.lineTo(x+r,y);
        ctx.lineTo(x+r,y-r*3/4);
        ctx.fill();
        ctx.stroke();
    }
    
    // 畫出表情臉
    var x = face.x;
    var y = face.y;
    var r = face.r;
    ctx.lineWidth = 3;
    ctx.strokeStyle = resetbutton.col;
    ctx.fillStyle = resetbutton.col;
    draw_circle(x,y,r,resetbutton.col);
    draw_circle(x-13,y-9,6,"#000000");  // 左眼
    draw_circle(x+13,y-9,6,"#000000");  // 右眼
    var w = 18;
    if( face.pat==0 ){
        draw_line(x-w/2,y+16,x+w/2,y+16, "#000000");  // 笑
    }else if( face.pat==1 ){
        draw_rect(x-w/2,y+10,w,12, "#000000");  // 平口
    }else if (face.pat==2 ){
        ctx.strokeStyle = "#000000";
        ctx.beginPath();
        ctx.arc( x, y+8, w/2, Math.PI, 0, true ); // 笑彎口
        ctx.stroke();
    }

    // 畫出訊息氣泡
    if( mes.exist ){    
        var w = 160;
        var h = 100;
        var x = view.w-w-10;
        var y = face.y-face.r-h-20;
        var r = 20;
        var col = "#ffffff";
        fukidasi(x,y,w,h,r,col);
        draw_text(x+r,y+r,mes.txt1,22,"#000000");
        draw_text(x+r,y+r+32,mes.txt2,22,"#000000");
    }
}

// 畫出單一格子
function draw_cel(cx,cy){
    var w = cel_w/2;
    var h = cel_h/2;
    var x = cel[cy][cx].x+w;
    var y = cel[cy][cx].y+h;
    var a = 0.9;
    // 四邊三角形
    triangle(x,y,x+w,y-h,x+w,y+h,cols[cel[cy][cx].col[0]],a);
    triangle(x,y,x+w,y+h,x-w,y+h,cols[cel[cy][cx].col[1]],a);
    triangle(x,y,x-w,y+h,x-w,y-h,cols[cel[cy][cx].col[2]],a);
    triangle(x,y,x-w,y-h,x+w,y-h,cols[cel[cy][cx].col[3]],a);
    // 外框
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
    ctx.moveTo(x, y + r);    // 左上
    ctx.arc(x + r,   y + h - r, r, Math.PI, Math.PI / 2, true);    // 左下
    ctx.lineTo(x+w*2/4-ss, y+h);
    ctx.lineTo(x+w*2/4, y+h+tt);
    ctx.lineTo(x+w*2/4+ss, y+h);
    ctx.arc(x+w-r, y+h-r, r, Math.PI/2, 0, true);        // 右下
    ctx.arc(x + w - r, y + r,   r, 0, Math.PI * 3 / 2, true);        // 右上
    ctx.arc(x+r,   y+r,   r, Math.PI*3/2, Math.PI, true);    // 回到左上
    ctx.closePath();
    ctx.fill();
}
