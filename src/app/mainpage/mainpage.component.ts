import { Component, OnInit, SecurityContext, ViewEncapsulation } from '@angular/core';
import * as THREE from 'three-full';
import * as Pressure from 'pressure';
import * as io from 'socket.io-client';
import { strictEqual } from 'assert';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-mainpage',
  templateUrl: './mainpage.component.html',
  styleUrls: ['./mainpage.component.less'],
  encapsulation: ViewEncapsulation.None
})

export class MainpageComponent implements OnInit {
  warn = 'UOを折りますか？';
  constructor() { }
  imagePath = "../assets/kyoko.png";
  ngOnInit() {
    init();
    const socket = io("https://api.starry-go-round.com");
    let uoid=""
    socket.on('uoid', data =>{
      uoid=data;
      console.log("uoid:"+data);
    });
    const uo = document.getElementById("uo") as HTMLAudioElement;
    //加速度発生イベント
    let isAudioEnabled = false;
    window.addEventListener("devicemotion", (e)=>{
      const g = e.rotationRate;
      const uof = 1500;
      if((g.alpha>uof || g.beta>uof ||g.gamma>uof)&&!isUoBurned){
        if(isAudioEnabled){
          uo_prepare();
        }
        else{
          modal.style.display = "block";
        }
      }
    });
    //3d touch対応
    let modal;
    Pressure.set('#wife', {
      change: (force, event) => {
        if (!isUoBurned) {
          if (force > 0.3) {
            this.imagePath = "../assets/kyoko_2.png";
            //console.log("change");
          }
          else {
            this.imagePath = "../assets/kyoko.png";
          }
          //console.log(force);
        }
      },
      end: () => {
        if (!isUoBurned) this.imagePath = "../assets/kyoko.png";
      },
      endDeepPress: () => {
        if (!isUoBurned) {
          const browser = window.navigator.userAgent.toLowerCase();
          if (browser.indexOf("safari") > -1 && browser.indexOf("chrome") == -1 && browser.indexOf("edge") == -1 && browser.indexOf("mobile") == -1) {
            modal.style.display = "block";
          }
          else {
            if(!isUoBurned){
              uo_prepare()
            }
          }
        }
      }
    });
    document.getElementsByClassName("yes")[0].addEventListener("click",function(){desktopSafariCantBurnUo(true);});
    document.getElementsByClassName("no")[0].addEventListener("click",function(){desktopSafariCantBurnUo(false);});
    function desktopSafariCantBurnUo(b) {
      if (b) {
        //socket
        socket.emit('burn',{"uoid":uoid});

        modal.style.display = "none";
        isUoBurned = true;
        uo.play();
        const img = document.querySelector("#wife > img") as HTMLImageElement;
        img.src = "../assets/kyoko_3.png";
        uo_burn();
        isAudioEnabled =true;
      }
      else {
        modal.style.display = "none";
      }
    }
    let a = 0;
    let anime;
    //uoの状態把握変数
    let isUoBurned = false;
    //UOを燃やせ
    function uo_burn() {
      a += 0.01;
      anime.style.opacity = a;
      if (a >= 1) {
        setTimeout(uo_fade, 22000);
      }
      else {
        setTimeout(uo_burn, 10);
      }
    }
    function uo_prepare(){
      if(!isUoBurned){
        //socket
        socket.emit('burn',{"uoid":uoid});

        isUoBurned = true;
        uo.play();
        const img = document.querySelector("#wife > img") as HTMLImageElement;
        img.src = "../assets/kyoko_3.png";
        uo_burn();
        isAudioEnabled = true;
      }
    }
    function uo_fade() {
      a -= 0.02;
      anime.style.opacity = a;
      if (a >= 0) {
        setTimeout(uo_fade, 100);
      }
      else {
        //console.log("done");
        isUoBurned = false;
        //angularで変更してもうまく反映されない
        const img=document.querySelector("#wife > img") as HTMLImageElement;
        img.src = "../assets/kyoko.png";
        //いちおう
        this.imagePath = "../assets/kyoko.png";
        //フィーバータイム終了
        //clearInterval(ferver_time);
      }
    }
    
    function init() {
      anime = document.getElementById("animetion-layer");
      modal = document.getElementById("modal-back");
      //流れ星
      //makeShootingstar();
      // 幅、高さ取得
      const width = window.innerWidth + 100;
      const height = window.innerHeight + 100;

      // レンダラの作成、DOMに追加
      const renderer = new THREE.WebGLRenderer({ alpha: true });
      renderer.setSize(width, height);
      renderer.setClearAlpha(0);
      document.getElementById("round").appendChild(renderer.domElement);

      // シーンの作成、カメラの作成と追加、ライトの作成と追加
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(50, width / height, 1, 100);
      camera.position.set(0, 0, 7);
      //camera.up.set(0, 1, 0);
      const light = new THREE.AmbientLight(0xffffff, 1);
      scene.add(light);
      // 座標軸を表示
      //const axesHelper = new THREE.AxesHelper(25);
      //scene.add(axesHelper);
      // メッシュの作成と追加
      //const grid = new THREE.GridHelper(0, 0);
      //scene.add(grid);
      const loader = new THREE.GLTFLoader();
      const url = '../assets/model/scene.gltf';
      renderer.gammaOutput = true;
      renderer.gammaFactor = 2.2;
      // OrbitControls の追加
      const controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.userPan = false;
      controls.userPanSpeed = 0.0;
      controls.center.set(4, 3, 0);
      controls.maxDistance = 500.0;
      controls.maxPolarAngle = Math.PI * 0.495;
      controls.autoRotate = false;
      controls.autoRotateSpeed = 1.0;

      const clock = new THREE.Clock();

      let mixer;

      // レンダリング
      const animation = () => {

        renderer.render(scene, camera);
        controls.update();

        if (mixer) {
          mixer.update(clock.getDelta());
        }

        requestAnimationFrame(animation);

      };

      animation();
      loader.load(url, (data) => {

        const gltf = data;
        const object = gltf.scene;
        const animations = gltf.animations;
        if (animations && animations.length) {

          let i;
          mixer = new THREE.AnimationMixer(object);


          for (i = 0; i < animations.length; i++) {
            mixer.clipAction(animations[i]).play();
            mixer.timeScale = 1 / 3;
          }
        }
        object.position.set(-3.4, 0, -0.5);
        scene.add(object);
      });
    }
  }

}
