async function checkWebGPUSupport() {
    if (!('gpu' in navigator)) { return false; }
    try { return !!await navigator.gpu.requestAdapter(); } catch (e) { return false; }
}

async function launch_legitscriptitis() {	
	var throbber	 				= document.querySelector("#throbber_wrap");
	var nogpu 						= document.querySelector("#no_webgpu");
	var container 					= document.querySelector(".container");
	var webgpu_support = await checkWebGPUSupport();
	if (!webgpu_support) {
		nogpu.style.display = 'flex';
		throbber.style.display = 'none';
	} else {
		await legitscriptitis.main();
		throbber.style.display = 'none';
		container.style.display = 'flex';
	}
}

launch_legitscriptitis();