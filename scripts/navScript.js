// This script will control the pop-up menus for the navigation

var menus;

function popupMenu(clickedButton)
{
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

window.onload = function(){
	var xhr = new XMLHttpRequest();

	xhr.open("GET", "navigation.html");

	xhr.onload = function(){
		var header = document.querySelector(".header");

		header.innerHTML = xhr.responseXML.querySelector("body").innerHTML;

		menus = header.querySelector("#popups").children;
	};

	xhr.setRequestHeader("If-Modified-Since", "Sat, 1 Jan 2010 00:00:00 GMT");

	xhr.send();
};