"use strict";

const cvs = document.getElementById("canvas");
const ctx = cvs.getContext("2d");

/****************************************
 キャラクターの基準が１コマ 32 x 48 px
 ので、canvasサイズは、横　32、縦　48　の倍数の大きさに。
 倍数である数値である以外、数字の大きさは適当
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
               おそらく 1s で 60増えます。
               ※ゲーミングディスプレイを使用していると、リフレッシュレートが120hzになり
               1s で 120回回るかもしれませんが、それは想定のGUY DEATH。

**********************************************************************************/

const game_parameter = {
  x            : SCREEN_SIZE_WIDTH / 2 - 16, // キャラクタ位置をcanvasの中心に。x = (枠の大きさ÷２)-(キャラの横幅の半分)
  y            : 209,
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

//コントローラー//
//左を押されれば leftプロパティをtrueに,ボタン離せばfalseに。
//右も同じです。左右共にfalseならば静止中です。

document.onkeydown = (e) => {
  if(e.key === "ArrowLeft"){ keyButton.Left = true;}
  if(e.key === "ArrowRight"){ keyButton.Right = true;}
};

document.onkeyup = (e) => {
  if(e.key === "ArrowLeft"){ keyButton.Left = false;}
  if(e.key === "ArrowRight"){ keyButton.Right = false;}
};

///////////////////////////////////////////////////////////////////////////////////



//ここで使うスプライトシートは、二次配布禁止の著作物なので、
//実際に作る方は、画像はここからダウンロードしてね。
//　→　https://seiga.nicovideo.jp/seiga/im3657666

//画像の読み込み。
const chaImg = new Image();
chaImg.src = "SpriteSheet.png";


//画像読み込みが終わった後から、mainLoop実行
chaImg.onload = () => {
  mainLoop();
}



/*************************************************************
今回はsetIntervalではなく、
requestAnimationFrame関数を使用してみます。

違い)
setInterval → 機械側の都合関係なく設定したリズムを刻む。
requestAnimationFrame → 機械側が描画の更新準備が整った時に呼び出し。

※requestAnimationFrameはディスプレイの性能に依存します。
倍速になる人は
 setInterval(mainLoop,60);
 で。
 
ちなみにrequestAnimationFrameは再帰関数です。(入門コース３章３項のあれ)
流れ)

mainLoopが動くと、フレームカウンター　＋１
↓
update関数とdraw関数を実行。
↓
ディスプレイが描画の準備が整ったところでmainLoopを実行。

以後、延々のループ。

*************************************************************/

function mainLoop(){
  game_parameter.frameCount++;
    update();
    draw();
  requestAnimationFrame(mainLoop);  // ←　「意味不明なんですけど」って時は、setIntervalで。ほぼ同じです。
};


/*****************************
↑ 
mainLoop関数の中の
requestAnimationFrame(mainLoop);
を消して

chaImg.onload = () => {
  setInterval(mainLoop,60);
}

でも同じ。
******************************/



//////////////////////////////////////////////////////////////////



//実際に背景とキャラクターを描画の実行する関数
function draw() {

  //表示画面
 
  //canvas全体を青色に指定
  ctx.fillStyle = "#6af"; 
  ctx.fillRect(0, 0, SCREEN_SIZE_WIDTH, SCREEN_SIZE_HEIGHT);
 
 
  //スプレットシートのイメージを表示。
  /***********************************************************
  drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh)
  image: 読み込んだ画像データ
  sx   : (スプレットシート側の)切り抜きの x 始点
  sy   : (スプレットシート側の)切り抜きの y 始点
  sw   : (スプレットシート側の)切り抜きする 横幅
  sh   : (スプレットシート側の)切り抜きする 高さ
  ドット絵が 32 x 48 px の大きさで並んでいるので
  一番左上のキャラを表示したい場合の sx,sy,sw,sh は (0,0,32,48)
  
  dx   : 切り抜いたイメージの描画位置の x 始点
  dy   : 切り抜いたイメージの描画位置の y 始点
  dw   : 切り抜いたイメージの横幅
  dh   : 切り抜いたイメージの高さ
  
  ※　dw と dh で実際描画される大きさを決めます。この値を変えることで
  　　切り抜いた部分を小さくしたり大きくしたりできます。
    　今回はMAG変数に2を入れてるので、実際の画像を２倍にして描画してます。
     
  ***********************************************************/
  //背景イメージの描画
  ctx.drawImage(chaImg,0,960,256,80,0,160,256 * MAG,80 * MAG);

  //各パラメータ数値を見える化(デバッグ)。おかしな挙動したらこの値をみてね。
  ctx.fillStyle = "#fff";
  ctx.fillText(`FRAME:${game_parameter.frameCount}`,0,10);
  ctx.fillText(`x:${game_parameter.x}`,0,30);
  ctx.fillText(`vx:${game_parameter.vx}`,0,50);
  ctx.fillText(`anime_count:${game_parameter.anime_count}`,0,70);
  ctx.fillText(`sprite_num_x:${game_parameter.sprite_num_x}`,0,90);
  ctx.fillText(`sprite_num_y:${game_parameter.sprite_num_y}`,0,110);
  ctx.fillText(`dir:${game_parameter.dir}`,0,130);
 
  ctx.fillText(`左移動　←　KEY　→　右移動　`,170,350); 
 
 
 /********************************************************************
 ここがキャラクターを描画部分。ほぼほぼ全部の引数部分が変数になっています。
 つまりはupdate関数で値を変えたものが反映されてます。今回は値が動かない
 コマの基本の大きさの 32 x 48 と、ジャンプせず歩くだけなので高さを209と
 直書きしてますが、ここもおそらくは変数にして書いたほうがよさそう。
 ********************************************************************/
　//キャラクタイメージの描画
  ctx.drawImage(chaImg,game_parameter.sprite_num_x,game_parameter.sprite_num_y,32,48,game_parameter.x,209,32 * MAG,48 * MAG);
};





/********************************************************************
キー操作があったときにパラメータの値を変える関数です。
ほぼほぼ基本的なif文のみ。onkeydown,okeyupで左右のtrue,falseと
値が変わったときに反応します。

もし、キー左がtrue になった場合、
方向情報の dir を １　に
もし加速度の値が　-4　を越えない間 + (-1)

右側も同じ。左も右もfalseの場合は dir を 0　にして静止状態に。

もしdir が 0 の場合、加速度xv　の値を 左右どっちの場合も 0 へ向かう加減計算。
これやらないと、キーを離した途端にキャラクターがビダドメとなり膝をこわします。

********************************************************************/

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


 //ここで表示位置 x に 加速度分値を加算。これで次のdraw関数が動いたときにキャラが動きます。 
 game_parameter.x += game_parameter.vx;
 

 
 
 /*************************************************************************
 キャラクターをコマ送りでアニメーションさせるための処理。
 frameCountの数値でもいいのですが、あえてアニメーションの速さを調整するのに
 frameCountの1/4のスピードでカウントするanime_countを作っています。
 
 変更するのは切り抜くイラストの開始座標。(横幅と高さは 32 x 48 px と常に同じな為。
 おそらくはここが、このプログラムの難所なんしょ。
 
 if文について
 
 もし、向きが０(静止中)で、加速度が０ならば
 スプレットシートの切り抜きを (0,0)に。(スプレットシートの一番左上のイラスト)
 
 dir が 1 の場合(左向き)
 切り抜き位置座標 y を 48 に。(スプライトシートの左上から下に48px位置に書かれた絵を表示)
 
 x 座標は、(game_parameter.anime_count % 8)で、アニメカウントを０～７の間をループ。
 
 その数値に、キャラの横幅 32 をかけることで、横幅 32 px で歩くコマが描かれたスプライトシート
 の絵が、順次横にスライドしてアニメーションします。
 
 *************************************************************************/

  //アニメーション設定
  //アニメーションスピードの調整
  if((game_parameter.frameCount) % 4 === 0) game_parameter.anime_count++;
  game_parameter.anime_count %= 800; // 数値が800になったら０にリセット。(800の値に意味は無い模様

 
  if (game_parameter.dir === 0 && game_parameter.vx === 0){ // 静止中で加速度0のとき
    game_parameter.sprite_num_y = 0;
    game_parameter.sprite_num_x = 0;
  }else if (game_parameter.dir === 1) { //左向きのとき
    game_parameter.sprite_num_y = 48;
    game_parameter.sprite_num_x = (game_parameter.anime_count % 8) * 32;
  }else if(game_parameter.dir === 2){  //右向きのとき
    game_parameter.sprite_num_y = 96;
    game_parameter.sprite_num_x = (game_parameter.anime_count % 8) * 32;
  };



  

  //左右ワープ設定 （ただ単に、キャラクターが画面からでたら左右逆からでてくるだけです
  // ※ちなみに if文にも { } を省略する書き方があります。
 
  if(game_parameter.x < -65) game_parameter.x = SCREEN_SIZE_WIDTH;
  else if(game_parameter.x > SCREEN_SIZE_WIDTH +32) game_parameter.x = (game_parameter.x % SCREEN_SIZE_WIDTH) -64;

};
