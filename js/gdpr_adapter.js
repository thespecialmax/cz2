window.gdprConsentCallbacks=[];window.GDPR={ready:function(callback){var consentGranted=document.cookie.indexOf('sec-banner-allow-all-cookies=true')>-1;if(consentGranted){callback();}else{window.gdprConsentCallbacks.push(callback);}}};window.flushConsentGuard=function(){for(var callback of window.gdprConsentCallbacks){try{callback();}catch(error){console.log("There was an error running that GDPR consent callback",callback);}}
window.gdprConsentCallbacks=undefined;};window.deferTrekkie=function(params){GDPR.ready(function(){window.trekkie.load(params);});};