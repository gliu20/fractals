let viewInstance = {};

const onInfo = (function () {
  const infoEle = document.querySelector("#info");

  return function (mergeInvocate, skippedInvocations, isIdle, progress) {
    infoEle.textContent = `
      ${isIdle ? "Idle." : "Running."}
      pixels per frame: ${mergeInvocate} 
      progress: ${Math.floor(progress * 10000) / 100}`;
  };
})();

const onProgress = (function () {
  const progressInfoEle = document.querySelector("#progressInfo");
  const progress = document.getElementById("progress");
  const subprogress = document.getElementById("subprogress");
  const progresslabel = document.getElementById("progresslabel");
  const subprogresslabel = document.getElementById("subprogresslabel");

  return function (subprogressNum, subprogressTotal, progressNum, progressTotal) {
    subprogress.value = Math.ceil((subprogressNum / subprogressTotal) * 100);
    subprogresslabel.innerText = `${subprogressNum} of ${subprogressTotal} Iterations complete`

    progress.value = Math.ceil((progressNum / progressTotal) * 100);
    progresslabel.innerText = `${progressNum} of ${progressTotal} Rounds complete`

    if (subprogressNum === 1 &&
      subprogressTotal === 1 &&
      progressNum === 1 &&
      progressTotal === 1) {
      progressInfoEle.remove();
    }
  }; 
})();

window.onload = async () => {
  const canvas = document.getElementById("viewer");

  canvas.width = parseInt(prompt("Width?",800));
  canvas.height = parseInt(prompt("Height?",800));

  const view = await vc.init(canvas);

  vc.makeJulia(view);
  vc.makeMandelbrot(view);
  vc.makeColoring(view);

  await vc.makeLookup(view, onProgress);
  await vc.startView(view, onInfo);
  
  vc.makeInteractive(view);

  viewInstance = view;
}
