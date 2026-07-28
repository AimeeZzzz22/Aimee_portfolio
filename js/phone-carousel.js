(function(){
  function setup(frame){
    var slides = frame.querySelector('.phone-slides');
    if(!slides) return;
    var dots = Array.prototype.slice.call(frame.querySelectorAll('.phone-dot'));
    var prevBtn = frame.querySelector('.phone-arrow--prev');
    var nextBtn = frame.querySelector('.phone-arrow--next');
    var count = slides.children.length;

    // Screens shorter than the frame get centered instead of top-aligned
    // with a blank gap; taller screens stay top-aligned and scrollable.
    Array.prototype.forEach.call(slides.children, function(slide){
      var img = slide.querySelector('img');
      if(!img) return;
      function checkFit(){
        if(!img.naturalWidth || !img.naturalHeight) return;
        var imgRatio = img.naturalWidth / img.naturalHeight;
        var slideRatio = slide.clientWidth / slide.clientHeight;
        slide.classList.toggle('fits', imgRatio >= slideRatio);
      }
      if(img.complete) checkFit(); else img.addEventListener('load', checkFit);
      window.addEventListener('resize', checkFit);
    });

    function activeIndex(){
      return Math.round(slides.scrollLeft / slides.clientWidth) || 0;
    }
    function render(){
      var i = activeIndex();
      dots.forEach(function(d, idx){ d.classList.toggle('active', idx === i); });
      if(prevBtn) prevBtn.disabled = i === 0;
      if(nextBtn) nextBtn.disabled = i === count - 1;
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
    window.addEventListener('resize', function(){ slides.scrollLeft = activeIndex() * slides.clientWidth; });

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
