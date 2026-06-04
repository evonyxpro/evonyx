/* ════════════════════════════════════════════════
   EVONYX — script.js  (Cosmic AI Clean Tech)
   1. Custom cursor
   2. Neural network canvas
   3. Nav scroll + burger
   4. Scroll reveal
   5. Animated counters
   6. Notify form
   7. 3D tilt on service cards
   8. Footer year
════════════════════════════════════════════════ */
(function(){
"use strict";

/* ── 1. CUSTOM CURSOR ── */
var dot = document.getElementById("cursorDot");
var ring = document.getElementById("cursorRing");
if(dot && ring && window.matchMedia("(hover:hover)").matches){
  var mx=-200,my=-200,rx=-200,ry=-200;
  document.addEventListener("mousemove",function(e){
    mx=e.clientX; my=e.clientY;
    dot.style.left=mx+"px"; dot.style.top=my+"px";
  });
  (function animRing(){
    rx+=(mx-rx)*.13; ry+=(my-ry)*.13;
    ring.style.left=rx+"px"; ring.style.top=ry+"px";
    requestAnimationFrame(animRing);
  })();
  var iEls=document.querySelectorAll("a,button,input,textarea,select,.svc-card,.phi-item");
  iEls.forEach(function(el){
    el.addEventListener("mouseenter",function(){
      dot.style.width="12px"; dot.style.height="12px";
      ring.style.width="52px"; ring.style.height="52px";
      ring.style.borderColor="var(--violet)";
    });
    el.addEventListener("mouseleave",function(){
      dot.style.width="6px"; dot.style.height="6px";
      ring.style.width="36px"; ring.style.height="36px";
      ring.style.borderColor="var(--cyan)";
    });
  });
}

/* ── 2. NEURAL NETWORK CANVAS ── */
var canvas=document.getElementById("neural");
if(canvas){
  var ctx=canvas.getContext("2d");
  var W,H,nodes=[],rafOn=true;
  var mouse={x:-9999,y:-9999};
  var N=110, CDIST=130, MDIST=220;

  function resize(){
    W=canvas.width=canvas.offsetWidth;
    H=canvas.height=canvas.offsetHeight;
  }

  function Node(){
    this.x=Math.random()*W;
    this.y=Math.random()*H;
    this.vx=(Math.random()-.5)*.4;
    this.vy=(Math.random()-.5)*.4;
    this.r=Math.random()*1.8+.5;
    this.pulse=Math.random()*Math.PI*2;
    // randomly cyan or violet
    this.color=Math.random()>.5?"rgba(0,245,255,":"rgba(124,58,237,";
  }

  Node.prototype.update=function(){
    this.pulse+=.02;
    this.x+=this.vx; this.y+=this.vy;
    if(this.x<0||this.x>W) this.vx*=-1;
    if(this.y<0||this.y>H) this.vy*=-1;
    var dx=this.x-mouse.x, dy=this.y-mouse.y;
    var d=Math.sqrt(dx*dx+dy*dy);
    if(d<MDIST&&d>0){
      var f=(MDIST-d)/MDIST*.018;
      this.vx+=(dx/d)*f; this.vy+=(dy/d)*f;
      var sp=Math.sqrt(this.vx*this.vx+this.vy*this.vy);
      if(sp>1.4){this.vx=(this.vx/sp)*1.4; this.vy=(this.vy/sp)*1.4;}
    }
  };

  Node.prototype.draw=function(){
    var alpha=(.4+Math.sin(this.pulse)*.2);
    ctx.beginPath();
    ctx.arc(this.x,this.y,this.r,0,Math.PI*2);
    ctx.fillStyle=this.color+alpha+")";
    ctx.fill();
    // glow for brighter nodes
    if(this.r>1.4){
      ctx.beginPath();
      ctx.arc(this.x,this.y,this.r*2.5,0,Math.PI*2);
      ctx.fillStyle=this.color+(alpha*.15)+")";
      ctx.fill();
    }
  };

  function drawEdges(){
    for(var i=0;i<nodes.length;i++){
      for(var j=i+1;j<nodes.length;j++){
        var dx=nodes[i].x-nodes[j].x;
        var dy=nodes[i].y-nodes[j].y;
        var d=Math.sqrt(dx*dx+dy*dy);
        if(d<CDIST){
          var a=(1-d/CDIST)*.2;
          // interpolate cyan to violet based on distance
          var t=d/CDIST;
          var r=Math.round(0+(124-0)*t);
          var g=Math.round(245+(58-245)*t);
          var b=Math.round(255+(237-255)*t);
          ctx.beginPath();
          ctx.moveTo(nodes[i].x,nodes[i].y);
          ctx.lineTo(nodes[j].x,nodes[j].y);
          ctx.strokeStyle="rgba("+r+","+g+","+b+","+a+")";
          ctx.lineWidth=.8;
          ctx.stroke();
        }
      }
      // mouse connections
      var mdx=nodes[i].x-mouse.x;
      var mdy=nodes[i].y-mouse.y;
      var md=Math.sqrt(mdx*mdx+mdy*mdy);
      if(md<MDIST){
        var ma=(1-md/MDIST)*.55;
        ctx.beginPath();
        ctx.moveTo(nodes[i].x,nodes[i].y);
        ctx.lineTo(mouse.x,mouse.y);
        ctx.strokeStyle="rgba(0,245,255,"+ma+")";
        ctx.lineWidth=1.2;
        ctx.stroke();
        // draw mouse dot
        ctx.beginPath();
        ctx.arc(mouse.x,mouse.y,3,0,Math.PI*2);
        ctx.fillStyle="rgba(0,245,255,.6)";
        ctx.fill();
      }
    }
  }

  function loop(){
    if(!rafOn) return;
    ctx.clearRect(0,0,W,H);
    nodes.forEach(function(n){n.update(); n.draw();});
    drawEdges();
    requestAnimationFrame(loop);
  }

  function init(){
    nodes=[];
    for(var i=0;i<N;i++) nodes.push(new Node());
  }

  window.addEventListener("resize",function(){resize(); init();});
  document.addEventListener("mousemove",function(e){
    var r=canvas.getBoundingClientRect();
    mouse.x=e.clientX-r.left; mouse.y=e.clientY-r.top;
  });
  document.addEventListener("mouseleave",function(){mouse.x=-9999; mouse.y=-9999;});
  document.addEventListener("visibilitychange",function(){
    rafOn=!document.hidden; if(rafOn) loop();
  });
  resize(); init(); loop();
}

/* ── 3. NAV ── */
var nav=document.getElementById("nav");
var burger=document.getElementById("burger");
var mMenu=document.getElementById("mobileMenu");
if(nav) window.addEventListener("scroll",function(){nav.classList.toggle("scrolled",window.scrollY>40);},{passive:true});
if(burger&&mMenu){
  burger.addEventListener("click",function(){
    burger.classList.toggle("open");
    mMenu.classList.toggle("open");
  });
  mMenu.querySelectorAll("a").forEach(function(a){
    a.addEventListener("click",function(){
      burger.classList.remove("open");
      mMenu.classList.remove("open");
    });
  });
}

/* ── 4. SCROLL REVEAL ── */
var revEls=document.querySelectorAll(".reveal");
if("IntersectionObserver" in window && revEls.length){
  var revObs=new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(!entry.isIntersecting) return;
      var delay=0;
      var sibs=entry.target.parentElement.querySelectorAll(".reveal");
      sibs.forEach(function(s,i){if(s===entry.target) delay=i;});
      setTimeout(function(){entry.target.classList.add("visible");},Math.min(delay*90,450));
      revObs.unobserve(entry.target);
    });
  },{threshold:.08,rootMargin:"0px 0px -40px 0px"});
  revEls.forEach(function(el){revObs.observe(el);});
} else {
  revEls.forEach(function(el){el.classList.add("visible");});
}

/* ── 5. ANIMATED COUNTERS ── */
var counters=document.querySelectorAll(".hstat-n");
var counted=false;
if(counters.length){
  var cObs=new IntersectionObserver(function(entries){
    if(entries[0].isIntersecting && !counted){
      counted=true;
      counters.forEach(function(el){
        var target=parseInt(el.getAttribute("data-target"),10);
        var start=0; var dur=1800;
        var step=target/dur*16;
        var raf=setInterval(function(){
          start+=step;
          if(start>=target){start=target; clearInterval(raf);}
          el.textContent=Math.floor(start);
        },16);
      });
    }
  },{threshold:.5});
  if(counters[0]) cObs.observe(counters[0].closest(".hero-stats")||counters[0]);
}

/* ── 6. NOTIFY FORM ── */
var nForm=document.getElementById("notifyForm");
var nNote=document.getElementById("notifyNote");
if(nForm&&nNote){
  nForm.addEventListener("submit",function(e){
    e.preventDefault();
    var inp=nForm.querySelector("input[type='email']");
    if(!inp||!inp.value.trim()) return;
    nNote.textContent="// ACCESS GRANTED — You'll be notified at launch.";
    nForm.reset();
  });
}

/* ── 7. 3D TILT ON SERVICE CARDS ── */
var cards=document.querySelectorAll(".svc-card");
cards.forEach(function(card){
  card.addEventListener("mousemove",function(e){
    var r=card.getBoundingClientRect();
    var x=(e.clientX-r.left)/r.width-.5;
    var y=(e.clientY-r.top)/r.height-.5;
    card.style.transform="translateY(-4px) rotateX("+(y*-8)+"deg) rotateY("+(x*8)+"deg)";
    card.style.transition="transform .05s";
  });
  card.addEventListener("mouseleave",function(){
    card.style.transform="";
    card.style.transition="transform .4s";
  });
});

/* ── 8. FOOTER YEAR ── */
var yr=document.getElementById("year");
if(yr) yr.textContent=new Date().getFullYear();

})();
