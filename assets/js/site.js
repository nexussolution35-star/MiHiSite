// Mi-Hi — minimal interactions (no analytics, no backend)
document.addEventListener('click',function(e){
  var links=document.getElementById('navLinks');
  if(links&&links.classList.contains('open')&&!e.target.closest('#navLinks')&&!e.target.closest('.nav-toggle')){links.classList.remove('open');}
});