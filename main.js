"use strict";

const cvs = document.getElementById("canvas");
const ctx = cvs.getContext("2d");

/****************************************
 キャラクターの基準が１コマ 32 x 48 px
 ので、横は32、縦は48の倍数の大きさに。
 倍数である数値である以外で数字の大きさは適当
*****************************************/

const SCREEN_SIZE_WIDTH = 512;
const SCREEN_SIZE_HEIGHT = 480;

// ↓　これで <canvas width="512"height="480"> に!!
cvs.width = SCREEN_SIZE_WIDTH ;
cvs.height = SCREEN_SIZE_HEIGHT;


//////////////////////////////////////////



/*************************************************
ドット絵が 32 x 48 と小さいので、背景とキャラクターの
大きさをそれぞれ２倍にしています。そしてcanvasの画像は
自動的にアンチエイリアス(ぼかしをいれてきれいにみせる)が
入るのですが、ドット絵には不必要なので切りまんすにき。

このプログラムはChrome上で動かすことを想定してるので、
Chrome用のコードだけ書いてます。
**************************************************/

const MAG = 2;
ctx.imageSmoothingEnabled = false;


///////////////////////////////////////////////////



/*********************************************************************************
「game_parameter」（グローバル変数)

各パラメータ

x  : キャラクターの表示座標　横
y  : キャラクターの表示座標　縦
vx : 加速度(これがないと移動キーを離すとキャラがビダ止まり)

sprite_num_x : スプライトシートでのキャラクター位置　横
sprite_num_y : スプライトシートでのキャラクター位置　縦

anime_count  : アニメーションのカウンタ。(腕をふるモーションが４枚あったら、
               数値を+1 することで　１枚め、２枚め、３枚めとパラパラ漫画のように
               動かすためのもの。)
dir          : キャラクターの向きの情報。( 0: 停止中 , 1: 左へ移動中, 2: 右へ移動中)
frameCount   : プログラムが動きだしてからのカウント・時間。
               おそらく 1s で 60fps (１秒間に60回描画)。
               ※ゲーミングディスプレイを使用していてリフレッシュレートが120hzになり
               1s で 120回回る人に関しては、想定GUY DEATH。

**********************************************************************************/

const game_parameter = {
  x            : 100,
  y            : 100,
  vx           : 0,
  sprite_num_x : 0,
  sprite_num_y : 0,
  anime_count  : 0,
  dir          : 0,
  frameCount   : 0
};


///////////////////////////////////////////////////////////////////////////////////


//右か左か、キーを押されているのかをチェックするオブジェクト。

const keyButton = {
  Left:false,
  Right:false
};

///////////////////////////////////////////////////////////////////////////////////






//ここで使うスプライトシートは、二次配布禁止の著作物なので、
//実際に作る方は、画像はここからダウンロードしてね。
//　→　https://seiga.nicovideo.jp/seiga/im3657666

//画像の読み込み。読み込んだら mainLoop関数を実行。
const chaImg = new Image();
chaImg.src = "SpriteSheet.png";
chaImg.onload = () => {
  mainLoop();
}




function mainLoop(){
  game_parameter.frameCount++;
    update();
    draw();
  requestAnimationFrame(mainLoop);
};


//コントローラー//

document.onkeydown = (e) => {
  if(e.key === "ArrowLeft"){ keyButton.Left = true;}
  if(e.key === "ArrowRight"){ keyButton.Right = true;}
};

document.onkeyup = (e) => {
  if(e.key === "ArrowLeft"){ keyButton.Left = false;}
  if(e.key === "ArrowRight"){ keyButton.Right = false;}
};



function draw() {

  //表示画面
  ctx.fillStyle = "#6af";
  ctx.fillRect(0, 0, SCREEN_SIZE_WIDTH, SCREEN_SIZE_HEIGHT);
  //                   (切り抜き位置,配置位置)
  ctx.drawImage(chaImg,0,960,256,80,0,160,256 * MAG,80 * MAG);

  ctx.fillStyle = "#fff";
  ctx.fillText(`FRAME:${game_parameter.frameCount}`,0,10);
  ctx.fillText(`x:${game_parameter.x}`,0,30);
  ctx.fillText(`vx:${game_parameter.vx}`,0,50);
  ctx.fillText(`anime_count:${game_parameter.anime_count}`,0,70);
  ctx.fillText(`sprite_num_x:${game_parameter.sprite_num_x}`,0,90);
  ctx.fillText(`sprite_num_y:${game_parameter.sprite_num_y}`,0,110);
  ctx.fillText(`dir:${game_parameter.dir}`,0,130);

  ctx.drawImage(chaImg,game_parameter.sprite_num_x,game_parameter.sprite_num_y,32,48,game_parameter.x,209,32 << 1,48 << 1);

}




function update(){
  //横移動
  if(keyButton.Left){
    game_parameter.dir = 1;
    if(game_parameter.vx > -4) game_parameter.vx -= 1;
  }else if(keyButton.Right){
    game_parameter.dir = 2;
    if(game_parameter.vx < 4) game_parameter.vx += 1;
  }else{
    game_parameter.dir = 0;
  };
  if(game_parameter.dir === 0){
    if(game_parameter.vx > 0) game_parameter.vx -= 1;
    if(game_parameter.vx < 0) game_parameter.vx += 1;
  }




  //アニメーション設定

  game_parameter.anime_count %= 750;


  //アニメーションスピードの調整
  if((game_parameter.frameCount) % 4 === 0) game_parameter.anime_count++;

  if (game_parameter.dir === 0 && game_parameter.vx === 0){
    game_parameter.sprite_num_y = 0;
    game_parameter.sprite_num_x = 0;
  }else if (game_parameter.dir === 1) {
    game_parameter.sprite_num_y = 48;
    game_parameter.sprite_num_x = (game_parameter.anime_count % 8) * 32;
  }else if(game_parameter.dir === 2){
    game_parameter.sprite_num_y = 96;
    game_parameter.sprite_num_x = (game_parameter.anime_count % 8) * 32;
  };



  game_parameter.x += game_parameter.vx;

  //左右ワープ設定
  if(game_parameter.x < -65) game_parameter.x = SCREEN_SIZE_WIDTH;
  else if(game_parameter.x > SCREEN_SIZE_WIDTH +32) game_parameter.x = (game_parameter.x % SCREEN_SIZE_WIDTH) -64;

};
