// This script will control the pop-up menus for the navigation

var menus;

function init()
{
	menus = document.getElementById("popups").children;
}

function popupMenu(clickedButton)
{
	if(menus[clickedButton].style.display == "initial")
	{
		menus[clickedButton].style.display = "none";
		return;
	}
	
	for(var i = 0; i < 4; i++)
	{
		menus[i].style.display = "none";
	}
	
	menus[clickedButton].style.display = "initial";
}

window.onload = init;