import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import * as io from 'socket.io-client';
import { Skeleton } from 'three';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
  encapsulation: ViewEncapsulation.None
})

export class AppComponent implements OnInit {
  title = 'kyoko-app';

  
  ngOnInit() {
    //console.log("test");
    let notFirst=false;
    const socket2 = io("https://api.starry-go-round.com");
    const num = document.getElementById("num");
    socket2.on('takamari', data => {
      console.log("count:"+data);
      num.textContent = data.toString().padStart(12, "0");;
      makeShootingstar(false,true);
      notFirst=true;
    });
    let bgm_play = false;
    document.getElementById("bgm_button").addEventListener("click",bgm_toggle,false);
    function bgm_toggle(){
      document.getElementById("bgm_button").classList.toggle("bgm_button_on");
      const bgm = document.getElementById("bgm") as HTMLAudioElement;
      if(bgm_play){
        bgm.pause();
        bgm_play=false;
      }
      else{
        bgm.play();
        bgm_play = true;
      }
    }
    function changeButton() {
      console.log("de");
      document.getElementById("navButton").classList.toggle("active");
      document.getElementById("menu").classList.toggle("active");
      document.getElementById("nav").classList.toggle("active");
    }
    document.getElementById("navButton").addEventListener('click', changeButton);
    //以下本文
    window.addEventListener('load', function () {
      makeShootingstar(true,false);
    });
    window.addEventListener('load', generateNightsky);

    let ferver_time;
    let isFerver = false;
    function fever() {
      console.log("フィーバータイム！");
      isFerver = true;
      //持続秒数
      const meteor = Math.floor(Math.random() * 30);
      //出現頻度
      const freq = Math.floor(Math.random() * 500) + 500;
      ferver_time = setInterval(function () {
        makeShootingstar(false,false);
      }, freq);
      setTimeout(function () {
        clearInterval(ferver_time);
        isFerver = false;
      }, meteor * 1000);
    }
    //流れ星を探そうよ
    function makeShootingstar(defaultStar,uo) {
      //0.5%の確率でフィーバー発生
      if (!isFerver && Math.random() > 0.995) {
        fever();
      }
      console.log("流れ星出現,属性:" + (defaultStar ? "恒常" : "限定"));
      let str_top = 0;
      let str_left = 0;
      const width = window.innerWidth;
      const height = window.innerHeight;
      //角度決定
      let deg = 0;
      //90°に近い値が出ないようにする
      //右から流れる確率を90%に
      if (Math.random() < 0.9) deg = Math.floor((Math.random() * 50) + 10);
      else deg = Math.floor(Math.random() * 50) + 120;
      //console.log(deg);
      const elm = document.getElementById("star_wrap");

      //速度決定
      const n = (width * height / 30000) * window.devicePixelRatio;
      //console.log(n);
      let str_speed = (Math.random() * n) + n;
      if(uo&&notFirst) str_speed = n*0.5;
      //位置決定
      let left = -100;
      if (deg > 90) {
        left = Math.floor(Math.random() * (width / 2));
      }
      else {
        left = Math.floor(Math.random() * (width + 1 - (width / 2))) + (width / 2);
      }
      let top = Math.floor(Math.random() * (height / 2));
      //上からくるか横からくるか
      //確率を画面の縦横比で決定(16:9=>上16/右9)
      const rand = Math.random();
      /*上の確率の計算方法
      1600x900
      1600+900 2500
      1/2500 = 0.0004
      0.0004*1600 0.64
      */
      const aspectRatio = (1 / (width + height)) * width;
      if (rand < aspectRatio) {
        //上から来る場合topは0
        top = -100;
      }
      else {
        //横から来る場合left=width
        if (deg > 90) {
          left = -100;
        }
        else {
          left = width + 100;
        }
      }
      //三角関数により移動率を算出
      const rad = ((180 - deg) * Math.PI) / 180;
      const movex = Math.sin(rad) * str_speed;
      const movey = Math.cos(rad) * str_speed;
      console.log(movex + "," + movey + "," + deg)
      //dom操作
      let newstar = document.createElement("div");
      let orange ="";
      if(uo&&notFirst) orange=" uo-star";
      newstar.className = "shooting-star"+orange;
      newstar.style.transform = "rotate(" + (180 - deg) + "deg)";
      str_left = left;
      str_top = top;
      newstar.style.display = "block";
      elm.appendChild(newstar);
      moveShootingstar(movex, movey, str_left, str_top, newstar, defaultStar);
    }
    function moveShootingstar(movex, movey, str_left, str_top, newstar, defaultStar) {
      const elm = document.getElementById("star_wrap");
      const width = window.innerWidth;
      const height = window.innerHeight;
      //座標計算
      newstar.style.top = str_top + movex + "px";
      str_top = str_top + movex;
      newstar.style.left = (str_left + movey) + "px";
      str_left = (str_left + movey);
      //画面外に出て消すときのマージン
      const margin = 500;
      if (str_left < -margin || str_left > width + margin || str_top > height + margin) {
        elm.removeChild(newstar);
        const nextShootingstarInterval = Math.round(Math.random() * 8) * 1000;
        //makeShootingstar(defaultStar);
        if (defaultStar) setTimeout(function () {
          makeShootingstar(true,false);
        }, nextShootingstarInterval);
        //30%の確率で２つ目の流れ星を追加
        const starDelay = (Math.floor(Math.random() * 400) + 300);
        if (Math.random() > 0.7) setTimeout(function () {
          makeShootingstar(false,false);
        }, nextShootingstarInterval + starDelay);
      }
      else {
        //console.log(str_top+","+str_left+","+deg);
        setTimeout(function () {
          moveShootingstar(movex, movey, str_left, str_top, newstar, defaultStar);
        }, 100);
        //17
      }
    }
    //夜空生成
    function generateNightsky() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      //個数決定
      const n = Math.floor(width * height / 3500) * window.devicePixelRatio;
      //console.log(n);
      for (let i = 0; i < n; i++) {
        const shimohito = i % 20;
        const elm = document.getElementById("anime-" + shimohito);
        let star = document.createElement("span");
        star.className = "star";
        //座標決定
        star.style.top = Math.floor(Math.random() * height * 0.7) + "px";
        star.style.left = Math.floor(Math.random() * width) + "px";
        const starSize = Math.floor(Math.random() * 10) + 10;
        star.style.width = starSize / 10 + "px";
        star.style.height = starSize / 10 + "px";
        const starColors = ["#fff", "#CEF6F5", "#FAAC58", "#F3F781", "#fff", "#D8D8D8", "#045FB4", "#E0F8F7", "#E6E6E6"];

        star.style.backgroundColor = starColors[Math.floor(Math.random() * (starColors.length + 1))];
        /*ばらつきをつける
        setTimeout(function(){
          const time = Math.random()*4+0.6;
          addAnimetion(star,time);
        },Math.random()*2000);
        */
        elm.appendChild(star);

      }
    }
    /*function addAnimetion(elm,time){
      elm.style.animation = "twinkle "+time+"s ease-in-out infinite";
      //console.log("twinkle ."+time+"s ease-in-out infinite");
    }*/
  }
}
