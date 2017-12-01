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