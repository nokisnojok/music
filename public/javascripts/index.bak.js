function $(s){
	return document.querySelectorAll(s)
}
var lis=$("#list li");
for(var i=0;i<lis.length;i++){
	lis[i].onclick=function(){
		for(var j=0;j<lis.length;j++){
			lis[j].className=""
		}
		this.className="selected"
		load("/musics/"+this.title)
	}
}


var xhr=new XMLHttpRequest();
var ac=new (window.AudioContext || window.webkitAudioContext)();
var gainNode=ac[ac.createGain?"createGain":"createGainNode"]()
var analyser=ac.createAnalyser();
var size=128
analyser.fftSize=size*2
analyser.connect(gainNode)
gainNode.connect(ac.destination)
var source
document.getElementById("nextOne").onclick=function(){
	try{
		source.stop()
	}catch(e){
		lis[Math.round(Math.random()*(lis.length-1))].click()
	}
	
}
document.getElementById("stop").onclick=function(){
	try{
		source.onended=""
		source.stop()
		source=""
	}catch(e){
		
	}
	
}
var count=0
var box=$("#box")[0]
var canvas=document.createElement("canvas")
var ctx=canvas.getContext("2d")
box.appendChild(canvas)
var height,width
function resize(){
	height=box.clientHeight;
	width=box.clientWidth;
	canvas.height=height;
	canvas.width=width;
	var line=ctx.createLinearGradient(0,0,0,height)
	line.addColorStop(0,"red")
	line.addColorStop(0.25,"orange")
	line.addColorStop(0.5,"yellow")
	line.addColorStop(0.75,"green")
	line.addColorStop(1,"blue")
	ctx.fillStyle=line
}
resize()
window.onresize=resize;
function draw(arr){
	ctx.clearRect(0,0,width,height)
	var w=width/size
	for(var i=0;i<size;i++){
		var h=arr[i]/256*height
		ctx.fillRect(w*i,height-h,w*0.8,h)
	}
}
function load(url){
	source && source[source.stop?"stop":"noteOff"]()
	var n=++count
	xhr.abort()
	xhr.open("GET",url)
	xhr.responseType="arraybuffer";
	xhr.onload=function(){
		if(n!=count) return
		ac.decodeAudioData(xhr.response,function(buffer){
			if(n!=count) return
			var bufferSource=ac.createBufferSource()
			bufferSource.buffer=buffer
			bufferSource.connect(analyser)
			bufferSource[bufferSource.start?"start":"noteOn"](0)
			bufferSource.onended=function(){
				lis[Math.round(Math.random()*(lis.length-1))].click()
			}
			source=bufferSource	
		},function(err){
			console.log(err)
		})
	}
	xhr.send()
}

function visualizer(){
	var arr=new Uint8Array(analyser.frequencyBinCount)
	analyser.getByteFrequencyData(arr)
	requestAnimationFrame=window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame
	//console.log(arr)
	function v(){
		analyser.getByteFrequencyData(arr)
		draw(arr)
		requestAnimationFrame(v)
	}
	requestAnimationFrame(v)
}

visualizer()



function changeVolume(percent){
	gainNode.gain.value=percent
}

$("#volume")[0].onchange=function(){
	changeVolume(this.value/this.max);
}
$("#volume")[0].onchange();



