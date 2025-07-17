const notifLink = document.querySelector("#link-notif");
notifLink.addEventListener("click", (e) => {
    e.preventDefault();

    loadPage("notifications", "notifications.html", ()=>{
        console.log("Notificações");
    });

    showPage("page-notifications");
    setActiveLink("link-notif");
});