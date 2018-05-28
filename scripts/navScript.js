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

function pageNav(e){
	e.preventDefault();
	loadContent(e.target.getAttribute("href"));
}

function loadContent(url){
	window.location.hash = url;

	url += ".html";

	var xhr = new XMLHttpRequest();

	xhr.open("GET", url);

	xhr.onload = function(){
		var contentDiv = document.querySelector(".content");

		var parser = new DOMParser();
		var loaded = parser.parseFromString(xhr.responseText, "text/html");
		
		contentDiv.innerHTML = loaded.body.innerHTML;
	};

	xhr.onerror = function(){
		var contentDiv = document.querySelector(".content");

		contentDiv.innerHTML =
		"<p><b>ERROR: </b>The requested content could not be found.</p>" + 
		"<a href='home' onclick='pageNav(event)'>Back Home</a>";
	}

	xhr.setRequestHeader("If-Modified-Since", "Sat, 1 Jan 2010 00:00:00 GMT");

	xhr.send();

	if(menus == null){
		menus = document.querySelector("#popups").children;
	}

	for(var i = 0; i < menus.length; i++){
		menus[i].style.display = "none";
	}
}

function stateHandler(){
	var url = window.location.hash.substring(1);

	if(url == ""){
		loadContent("home");	
	}

	else{
		loadContent(url);
	}
}

window.onload = stateHandler;
window.onpopstate = stateHandler;