(function(){
  function setup(frame){
    var slides = frame.querySelector('.phone-slides');
    if(!slides) return;
    var dots = Array.prototype.slice.call(frame.querySelectorAll('.phone-dot'));
    var prevBtn = frame.querySelector('.phone-arrow--prev');
    var nextBtn = frame.querySelector('.phone-arrow--next');
    var count = slides.children.length;
    var slideEls = Array.prototype.slice.call(slides.children);
    var REAL_PHONE_RATIO = 2532 / 1170; // height/width, caps how tall the frame gets

    // Size the frame to match the active screen's real proportions: short
    // screens shrink the frame so there's no blank gap, long scrollable
    // pages are capped at a realistic phone height and scroll internally.
    function resizeToSlide(index){
      var slide = slideEls[index];
      if(!slide) return;
      var img = slide.querySelector('img');
      if(!img) return;
      function apply(){
        if(!img.naturalWidth || !img.naturalHeight) return;
        var w = frame.clientWidth;
        var maxH = w * REAL_PHONE_RATIO;
        var natH = w * (img.naturalHeight / img.naturalWidth);
        frame.style.height = Math.min(natH, maxH) + 'px';
      }
      if(img.complete) apply(); else img.addEventListener('load', apply, { once:true });
    }

    function activeIndex(){
      return Math.round(slides.scrollLeft / slides.clientWidth) || 0;
    }
    function render(){
      var i = activeIndex();
      dots.forEach(function(d, idx){ d.classList.toggle('active', idx === i); });
      if(prevBtn) prevBtn.disabled = i === 0;
      if(nextBtn) nextBtn.disabled = i === count - 1;
      resizeToSlide(i);
    }
    function goTo(i){
      i = Math.max(0, Math.min(count - 1, i));
      slides.scrollTo({ left: i * slides.clientWidth, behavior:'smooth' });
    }

    slides.addEventListener('scroll', function(){
      window.requestAnimationFrame(render);
    }, { passive:true });

    dots.forEach(function(d, idx){
      if(d.tagName === 'BUTTON'){
        d.addEventListener('click', function(){ goTo(idx); });
      }
    });
    if(prevBtn) prevBtn.addEventListener('click', function(){ goTo(activeIndex() - 1); });
    if(nextBtn) nextBtn.addEventListener('click', function(){ goTo(activeIndex() + 1); });
    window.addEventListener('resize', function(){
      slides.scrollLeft = activeIndex() * slides.clientWidth;
      resizeToSlide(activeIndex());
    });

    // Mouse drag-to-swipe (touch devices already get native scroll+snap)
    var dragging = false, movedEnough = false, startX = 0, startScroll = 0;
    slides.addEventListener('pointerdown', function(e){
      if(e.pointerType !== 'mouse') return;
      dragging = true; movedEnough = false;
      startX = e.clientX; startScroll = slides.scrollLeft;
      slides.classList.add('is-dragging');
      slides.setPointerCapture(e.pointerId);
    });
    slides.addEventListener('pointermove', function(e){
      if(!dragging) return;
      var dx = e.clientX - startX;
      if(Math.abs(dx) > 4) movedEnough = true;
      slides.scrollLeft = startScroll - dx;
    });
    function endDrag(){
      if(!dragging) return;
      dragging = false;
      slides.classList.remove('is-dragging');
      if(movedEnough) goTo(activeIndex());
    }
    slides.addEventListener('pointerup', endDrag);
    slides.addEventListener('pointercancel', endDrag);
    slides.addEventListener('pointerleave', endDrag);
    // If this frame sits inside a link, don't let a drag-release navigate away
    slides.addEventListener('click', function(e){
      if(movedEnough){ e.preventDefault(); e.stopPropagation(); }
    }, true);

    render();
  }

  document.addEventListener('DOMContentLoaded', function(){
    Array.prototype.forEach.call(document.querySelectorAll('.phone-frame'), setup);
  });
})();
