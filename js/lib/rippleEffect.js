function rippleEffect() {
    let ripple, ripples, RippleEffect, loc, cover, coversize, style, x, y, i, num;

    ripples = document.querySelectorAll('.ripple');
    //位置を取得
    RippleEffect = function(e) {
        ripple = this; //get item
        cover = document.createElement('span'); //create span
        coversize = ripple.offsetWidth; //get width
        loc = ripple.getBoundingClientRect(); //get absolute position
        x = e.pageX - loc.left - window.pageXOffset - (coversize / 2);
        y = e.pageY - loc.top - window.pageYOffset - (coversize / 2);
        pos = 'top:' + y + 'px; left:' + x + 'px; height:' + coversize + 'px; width:' + coversize + 'px;';

        //Append span
        ripple.appendChild(cover);
        cover.setAttribute('style', pos);
        cover.setAttribute('class', 'rp-effect'); //add class

        //4s delete span
        setTimeout(function() {
            let list = document.getElementsByClassName("rp-effect");
            for (let i = list.length - 1; i >= 0; i--) { //latest delete
                list[i].parentNode.removeChild(list[i]);
            }
        }, 4000)
    };
    for (i = 0, num = ripples.length; i < num; i++) {
        ripple = ripples[i];
        ripple.addEventListener('mousedown', RippleEffect);
    }
}