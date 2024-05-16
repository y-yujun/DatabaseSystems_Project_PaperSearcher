function openLoginModal() {
    document.getElementById("loginModal").style.display = "block";
};

function closeLoginModal() {
    document.getElementById("loginModal").style.display = "none";
};

function openSignupModal() {
    document.getElementById("signupModal").style.display = "block";
};

function closeSignupModal() {
    document.getElementById("signupModal").style.display = "none";
};

window.onclick = function (event) {
    const loginModal = document.getElementById("loginModal");
    const signupModal = document.getElementById("signupModal");

    if (event.target == loginModal) {
        loginModal.style.display = "none";
    }

    if (event.target == signupModal) {
        signupModal.style.display = "none";
    }
};
