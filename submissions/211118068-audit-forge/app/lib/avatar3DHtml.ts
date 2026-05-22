function buildScriptTag(scriptSrc: string): string {
  // URL ise src ile yükle; inline JS içeriği ise doğrudan göm
  if (scriptSrc.startsWith('http://') || scriptSrc.startsWith('https://') || scriptSrc.startsWith('file://')) {
    return `<script type="module" src="${scriptSrc.replace(/"/g, '&quot;')}"><\/script>`;
  }
  return `<script type="module">${scriptSrc}<\/script>`;
}

export function buildAvatarViewerHtml(glbSrc: string, scriptSrc: string): string {
  const safe = glbSrc.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
  ${buildScriptTag(scriptSrc)}
  <style>
    html,body{margin:0;width:100%;height:100%;background:#0B1220;overflow:hidden}
    model-viewer{width:100%;height:100%;background:#0B1220;--poster-color:#0B1220}
  </style>
</head>
<body>
  <model-viewer
    id="mv"
    src="${safe}"
    camera-controls
    camera-target="0m 1.63m 0m"
    camera-orbit="0deg 80deg 0.46m"
    min-camera-orbit="auto auto 0.2m"
    max-camera-orbit="auto auto 1.2m"
    field-of-view="26deg"
    exposure="1.0"
    shadow-intensity="0.5"
    interaction-prompt="none"
  ></model-viewer>
  <script>
    (function(){
      var post = function(m){ try{ window.ReactNativeWebView.postMessage(String(m)); }catch(e){} };
      var mv = document.getElementById('mv');

      // Lipsync: setMouthOpen(0-1) hafif ölçek animasyonu
      window.setMouthOpen = function(v){
        var s = (1 + Math.min(1, Math.max(0, v)) * 0.06).toFixed(4);
        mv.style.transform = 'scale(' + s + ')';
      };

      var scriptOk = false;
      var t = setInterval(function(){
        if(customElements.get('model-viewer')){
          scriptOk = true;
          clearInterval(t);
          post('stage:script-ok');
        }
      }, 200);
      setTimeout(function(){ clearInterval(t); if(!scriptOk) post('fail:script'); }, 15000);

      mv.addEventListener('progress', function(e){
        var p = (e.detail && e.detail.totalProgress) ? e.detail.totalProgress : 0;
        post('glb:' + Math.round(p * 100));
      });
      mv.addEventListener('load', function(){ post('done'); });
      mv.addEventListener('error', function(){ post('fail:glb'); });
    })();
  <\/script>
</body>
</html>`;
}
