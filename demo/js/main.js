// 全局控制
var clutterBol = true; // 是否开启频率数据左右对齐
var playWay = 0; // 播放方式 0 = 列表循环; 1 = 随机播放; 2 = 单曲循环。
var globalVolume = 0.3;


$("#go").click(function(){

    if($(this).hasClass("start")){

        var audio = $(".music-player")[0];
        if($(this).hasClass("playing")){

            audio.pause();
            $(this).removeClass("playing");
        }else{
            audio.play();
            $(this).addClass("playing")
        }
    }else{
        run();
    }

});

var $canvas = $("#myCanvas");
var $canvas1 = $("#myCanvas1");
var wW = $(window).width();
var wH = $(window).height();
var zhuNum = 30;
var size = 1;
var cw = 640 / 2;
var ch = 360 / 2;
$canvas.attr("width", cw);
$canvas.attr("height", ch);
var ctx = $canvas[0].getContext("2d");
$canvas1.attr("width", cw);
$canvas1.attr("height", ch);
var ctx1 = $canvas1[0].getContext("2d");

var bgImg = new Image();
bgImg.onload= function(){

}
bgImg.src = '2.jpg';

var bgImg1 = new Image();
bgImg1.onload= function(){

}
bgImg1.src = '1.jpg';


function Slide(){
    this.w = cw / zhuNum;
    this.color = '#ffce06'
}
Slide.prototype.setData = function(_h, _i, _clutterH){
    if(_h <= 1){
        // _h = 1;
    }
    this.h = ch * (_h / 256);
    this.x = this.w * _i;
    this.bili = cw / bgImg.width;
    this.clutterH = ch * (_clutterH / 256);
}

Slide.prototype.draw = function(){


    // 让该值不能为0 兼容火狐
    var imgh = this.h / this.bili;
    if(imgh == 0) imgh = 0.0001;

    if(clutterBol){
        var clutterImgh = this.clutterH / this.bili;
        if(clutterImgh == 0) clutterImgh = 0.0001;
    }

    ctx.drawImage(bgImg, (this.x + this.w * (1-size)/2)/ this.bili, (ch - this.h)/this.bili, this.w*size / this.bili, imgh, this.x + this.w * (1-size)/2, ch - this.h, this.w*size, this.h);
    // 左侧倒影数据
    ctx1.drawImage(bgImg1, (cw-this.x + this.w * (1-size)/2)/this.bili, (ch - this.clutterH)/this.bili, (this.w*size)/this.bili, clutterImgh, cw-this.x + this.w * (1-size)/2, ch - this.clutterH, this.w*size, this.clutterH);

}


function run() {
    $("#go").addClass("start");
    // audioSource 为音频源，bufferSource为buffer源
    var audioSource, bufferSource;

    //实例化音频对象
    var AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;

    if (!AudioContext) {
        alert("您的浏览器不支持audio API，请更换浏览器（chrome、firefox）再尝试")
        return;
    }

    var AC = new AudioContext();

    // analyser为analysernode，具有频率的数据，用于创建数据可视化
    var analyser = AC.createAnalyser();

    // gain为gainNode，音频的声音处理模块
    var gainnode = AC.createGain();
    gainnode.gain.value = 1;

    //计时器
    var RAF = (function() {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
            window.setTimeout(callback, 1000/6);
        };
    })();



    //音乐控制相关。
    var currentPlayIndex = 0;
    var audio = $(".music-player")[0];
    chooseMusic(musicArr[currentPlayIndex].src);

    // 下一首
    function nextItem(){

        // 判断当前播放方式
        switch (playWay){
            case 0:
                currentPlayIndex >= musicArr.length-1? currentPlayIndex = 0 : currentPlayIndex++;
                break;
            case 1:
                currentPlayIndex = randomFn(0, musicArr.length - 1);
                break;
            case 2:
                currentPlayIndex >= musicArr.length-1? currentPlayIndex = 0 : currentPlayIndex++;
                break;
            default: currentPlayIndex >= musicArr.length-1? currentPlayIndex = 0 : currentPlayIndex++;
        }

        chooseMusic(musicArr[currentPlayIndex].src);
    }

    //上一首
    function prevItem(){

        // 判断当前播放方式
        switch (playWay){
            case 0:
                currentPlayIndex <= 0 ? currentPlayIndex = musicArr.length-1 : currentPlayIndex--;
                break;
            case 1:
                currentPlayIndex = randomFn(0, musicArr.length - 1);
                break;
            case 2:
                currentPlayIndex <= 0 ? currentPlayIndex = musicArr.length-1 : currentPlayIndex--;
                break;
            default: currentPlayIndex <= 0 ? currentPlayIndex = musicArr.length-1 : currentPlayIndex--;
        }


        chooseMusic(musicArr[currentPlayIndex].src);
    }

    $("#next").click(nextItem);
    $("#prev").click(prevItem);

    // 播放结束后自动播放下一首
    $(audio).on("ended", function(){

        // 2为单曲循环
        playWay == 2? chooseMusic(musicArr[currentPlayIndex].src) : nextItem();
    });



    // 播放方式切换
    $(".play-way").click(function(){

        playWay >= 2? playWay = 0 : playWay++;
        console.log(playWay);
        if(playWay == 0){
            $(this).html('<i class="fa fa-fw fa-retweet"></i>');
        }else if(playWay == 1){
            $(this).html('<i class="fa fa-fw fa-random"></i>');
        }else if(playWay == 2){
            $(this).html('<i class="fa fa-fw fa-repeat"></i>');
        }
    })

    // 音量控制
    $(audio)[0].volume = globalVolume;

    $(".set-volume").on("blur", function(){
        $(audio)[0].volume =Number($(this).val() / 10);
    });

    // 进度条
    function progressArticle(){

        var totalTimeLength; // 总时长
        audio.duration? totalTimeLength = audio.duration : totalTimeLength = 0;
        var currentTimeLength = audio.currentTime; // 当前时间

        var percentage; // 所走百分比
        currentTimeLength / totalTimeLength? percentage = currentTimeLength / totalTimeLength : percentage = 0;
        percentage = percentage * 100;
        if(percentage >= 100) percentage = 100;

        // 当前分钟与秒
        var currentTimeMinutes = timeOptimize(parseInt(parseInt(currentTimeLength) / 60));
        var currentTimeSeconds = timeOptimize(parseInt(parseInt(currentTimeLength) % 60));

        // 总分钟与秒
        var totalTimeMinutes = timeOptimize(parseInt(parseInt(totalTimeLength) / 60));
        var totalTimeSeconds = timeOptimize(parseInt(parseInt(totalTimeLength) % 60));



        $(".date-view").text(currentTimeMinutes + ':' + currentTimeSeconds + '/' + totalTimeMinutes + ':' + totalTimeSeconds);
        $(".color-article").css({
            width: percentage + "%"
        });
        $(".progress-round").css("left", percentage + "%")
    }
    // 时间优化 小于10时+0
    function timeOptimize(_time){
        if(_time < 10){
            return '0' + _time;
        }else{
            return _time;
        }
    }

    // 进度条交互
    $(".progress-article > .bg").click(function(e){

        var w = $(this).width();
        var x = e.clientX;
        var l = $(this).offset().left;
        x -= l;
        var num;
        x <= 0? num = 0 : num = x / w;
        audio.currentTime = audio.duration * num;
    });

    //选择audio作为播放源
    function chooseMusic(src) {
        audio.src = src;
        audio.load();
        playMusic(audio);

        $("#go").addClass("playing");
        $("#name").text(musicArr[currentPlayIndex].name)
    }

    //音频播放
    function playMusic(arg) {
        var source;
        //如果arg是audio的dom对象，则转为相应的源
        if (arg.nodeType) {
            audioSource = audioSource || AC.createMediaElementSource(arg);
            source = audioSource;
        } else {
            bufferSource = AC.createBufferSource();

            bufferSource.buffer = arg;

            bufferSource.onended = function() {
                app.trigger(singleLoop ? nowIndex : (nowIndex + 1));
            };

            //播放音频
            setTimeout(function() {
                bufferSource.start()
            }, 0);

            source = bufferSource;
        }

        //连接analyserNode
        source.connect(analyser);

        //再连接到gainNode
        analyser.connect(gainnode);

        //最终输出到音频播放器
        gainnode.connect(AC.destination);
    }


    var num = 0;
    function animate() {

        if(num % 2 == 0){
            //出来的数组为8bit整型数组，即值为0~256，整个数组长度为1024，即会有1024个频率，只需要取部分进行显示
            var array_length = analyser.frequencyBinCount;
            var array = new Uint8Array(array_length);
            analyser.getByteFrequencyData(array); //将音频节点的数据拷贝到Uin8Array中

            // var array1 = new Float32Array(analyser.fftSize); // Float32Array needs to be the same length as the fftSize
            // analyser.getFloatTimeDomainData(array1); // fill the Float32Array with data returned from getFloatTimeDomainData()
            // console.log("频率数据", array);
            // console.log("波形数据", array1);

            var num1 = parseInt(array.length / zhuNum);
            var arr = [];
            var arr1 = []; //另外一组数据，实现左右不同

            // 分割数组
            for(var i = 1; i < zhuNum; i++){

                arr.push(array[num1*i]);
                num1*i - 10 > 0? arr1.push(array[num1*i - 10]) : arr1.push(array[0]);

            }

            ctx.clearRect(0,0,cw,ch);
            ctx1.clearRect(0,0,cw,ch);
            for(var j = 0; j < arr.length; j++){

                var slide = new Slide();
                slide.setData(arr[j], j, arr1[j]);
                slide.draw();
            }
            progressArticle();
        }


        num ++;
        if(num > 1000){
            num = 0;
        }

        // 执行
        RAF(animate);
    }
    animate();
}
run();




//随机数函数
function randomFn(a, b) {
    return parseInt(Math.random() * (b - a + 1) - a);
}










