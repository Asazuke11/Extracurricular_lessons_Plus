"use strict";

const cvs = document.getElementById("canvas");
const ctx = cvs.getContext("2d");


const SCREEN_SIZE_WIDTH = 512;
const SCREEN_SIZE_HEIGHT = 448;

cvs.width = SCREEN_SIZE_WIDTH ;
cvs.height = SCREEN_SIZE_HEIGHT;


//canvasの中の画像のアンチエイリアスをOFF
ctx.imageSmoothingEnabled = false;


const game_parameter = {
  x          : 100,
  y          : 100,
  vx         : 0,
  sprite_num_x : 0,
  sprite_num_y : 0,
  anime      : 0,
  anime_count: 0,
  dir        : 0,
  frameCount : 0
};

const keyButton = {
  Left:false,
  Right:false
};


//ここで使うスプライトシートは、二次配布禁止の著作物なので、
//実際に作る方は、画像はここからダウンロードしてね。
//https://seiga.nicovideo.jp/seiga/im3657666

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
  ctx.drawImage(chaImg,0,960,256,80,0,160,256 * 2,80 * 2);

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
