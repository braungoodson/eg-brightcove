var console = console || {};
console.log = console.log || function() {};

(function(){
	document.getElementById('ie8-console').innerHTML += '<center><span style="color:red; font-weight:bold;"> -> iPad Console <- </span></center><br />';
	if (window.navigator.userAgent.toLowerCase().match(/msie 8/g)) {
		document.getElementById('ipad-console').style.display = "block";
		console.log = function(l) {
			if (typeof l === "object") {
				l = '<br /><br /><pre>'+JSON.stringify(l,null,'\t')+'</pre>';
			}
			document.getElementById('ipad-console').innerHTML += '<span style="color:red; font-weight:bold;"> console&gt; </span>' + l + '<br />';
		}
	}
})();