// This script will control the pop-up menus for the navigation

var menus;

function popupMenu(e, clickedButton)
{
	e.preventDefault();

	if(menus == null)
	{
		menus = document.getElementById("popups").children;
	}

	if(menus[clickedButton].style.display == "inline-block")
	{
		menus[clickedButton].style.display = "none";
		return;
	}
	
	for(var i = 0; i < 4; i++)
	{
		menus[i].style.display = "none";
	}
	
	menus[clickedButton].style.display = "inline-block";
}

function loadContent(e){
	e.preventDefault();
	var url = e.target.getAttribute("href");

	var xhr = new XMLHttpRequest();

	xhr.open("GET", url);

	xhr.onload = function(){
		var contentDiv = document.querySelector(".content");

		var parser = new DOMParser();
		var loaded = parser.parseFromString(xhr.responseText, "text/html");
		
		contentDiv.innerHTML = loaded.body.innerHTML;
	};

	xhr.setRequestHeader("If-Modified-Since", "Sat, 1 Jan 2010 00:00:00 GMT");

	xhr.send();

	if(menus == null){
		menus = document.querySelector("#popups").children;
	}

	for(var i = 0; i < menus.length; i++){
		menus[i].style.display = "none";
	}
}

window.onload = function(){
	// https://stackoverflow.com/questions/136617/how-do-i-programmatically-force-an-onchange-event-on-an-input
	var e = new Event("click");
	document.querySelector("a").dispatchEvent(e);
};